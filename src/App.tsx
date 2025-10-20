// src/App.tsx
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { uploadData, list, getUrl, type ListPaginateWithPathOutput } from 'aws-amplify/storage';

const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();

  // Todos (existing)
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // Files (new)
  const FILE_PREFIX = 'user-uploads/'; // must match backend path
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<Array<{ path: string; name: string }>>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Existing todos subscription
  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // NEW: List files under user-uploads/
  async function refreshFiles() {
    setIsLoadingFiles(true);
    try {
      const out: ListPaginateWithPathOutput = await list({
        // List all objects under the prefix
        path: FILE_PREFIX,
        options: { listAll: true },
      });
      const items = (out.items ?? []).map((i) => ({
        path: i.path, // full path, e.g., "user-uploads/photo.jpg"
        name: i.path.replace(FILE_PREFIX, ''), // display neat filename
      }));
      setFiles(items);
    } finally {
      setIsLoadingFiles(false);
    }
  }

  // Load files once on mount and after sign-in
  useEffect(() => {
    refreshFiles();
  }, []);

  // NEW: Handle file selection + upload
  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await uploadData({
        path: `${FILE_PREFIX}${selectedFile.name}`,
        data: selectedFile,
      }).result; // wait for completion
      setSelectedFile(null);
      await refreshFiles();
    } finally {
      setIsUploading(false);
    }
  }

  // NEW: Download on click (opens presigned URL)
  async function download(path: string) {
    const { url } = await getUrl({ path });
    // Open a new tab to download (or use <a download> if you prefer)
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)}
            key={todo.id}>{todo.content}</li>
        ))}
      </ul>

      {/* --- Files section --- */}
      <h2 style={{ marginTop: 24 }}>Files on S3</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>
        <button onClick={refreshFiles} disabled={isLoadingFiles}>
          {isLoadingFiles ? 'Refreshing…' : 'Refresh list'}
        </button>
      </div>

      <ul>
        {files.map((f) => (
          <li key={f.path} onClick={() => download(f.path)}>
            {f.name}
          </li>
        ))}
        {files.length === 0 && !isLoadingFiles && <li>No files yet.</li>}
      </ul>
      {/* --- end Files section --- */}

      <div>
        🥳 App successfully hosted. Try creating a new todo and uploading a file.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
