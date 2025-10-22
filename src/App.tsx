import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
// NEW: Storage v6 APIs
import { uploadData, list, getUrl, type ListPaginateWithPathOutput } from 'aws-amplify/storage';

const client = generateClient<Schema>();
const FILE_PREFIX = 'user-uploads/'; // must match backend access rule

function App() {
  const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // --- File state ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<Array<{ path: string; name: string }>>([]);

  // Existing Todos subscription
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

  // --- List files (v6 list API) ---
  async function refreshFiles() {
    setIsLoadingFiles(true);
    try {
      const out: ListPaginateWithPathOutput = await list({
        path: FILE_PREFIX,
        options: { listAll: true },
      });
      const items = (out.items ?? []).map(i => ({
        path: i.path,
        name: i.path.replace(FILE_PREFIX, ''),
      }));
      setFiles(items);
    } finally {
      setIsLoadingFiles(false);
    }
  }

  useEffect(() => {
    refreshFiles();
  }, []);

  // --- Upload (v6 uploadData; await .result) ---
  async function handleUpload() {
    if (!selectedFile) {
      alert('Choose a file first.');
      return;
    }
    setIsUploading(true);
    try {
      // Per docs: uploadData({ path, data }) and (best practice) await .result
      await uploadData({
        path: `${FILE_PREFIX}${selectedFile.name}`,
        data: selectedFile,
      }).result; // awaits the actual transfer (docs show both with & without .result)
      setSelectedFile(null);
      await refreshFiles();
    } catch (e: any) {
      alert('Upload failed: ' + (e?.message || String(e)));
      // Also check browser console for details (403 usually means path/auth rule mismatch)
      console.error('Upload error', e);
    } finally {
      setIsUploading(false);
    }
  }

  // --- Download (presigned URL) ---
  async function download(path: string) {
    const { url } = await getUrl({ path });
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }



  return (
    <main>
      <h1>My todos</h1>
      <button type="button" onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>{todo.content}</li>
        ))}
      </ul>

      {/* Files section */}
      <h2 style={{ marginTop: 24 }}>Files on S3</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
        <button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>
        <button type="button" onClick={refreshFiles} disabled={isLoadingFiles}>
          {isLoadingFiles ? 'Refreshing…' : 'Refresh list'}
        </button>
      </div>

      <ul>
        {files.map((f) => (
          <li key={f.path} onClick={() => download(f.path)} style={{ cursor: 'pointer' }}>
            {f.name}
          </li>
        ))}
        {files.length === 0 && !isLoadingFiles && <li>No files yet.</li>}
      </ul>

      <div>
        🥳 App successfully hosted. Try creating a new todo and uploading a file.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button type="button" onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
