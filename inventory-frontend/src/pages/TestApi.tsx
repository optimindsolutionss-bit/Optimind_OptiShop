import { useEffect, useState } from "react";
import { getItems } from "../api";

function TestApi() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">❌ Error: {error}</p>;
  if (!data) return <p className="text-gray-500">Cargando items...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📦 Items del backend</h1>
      <pre className="bg-white p-4 rounded shadow-md text-sm text-gray-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default TestApi;
