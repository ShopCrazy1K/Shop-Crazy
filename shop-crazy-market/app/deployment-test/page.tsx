// Visible test to verify deployments are working
export default function DeploymentTestPage() {
  const testId = "DEPLOYMENT-TEST-2024-01-04-V2";
  
  return (
    <div className="container mx-auto p-8">
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">✅ Deployment Test - {testId}</h1>
        <p className="text-lg mb-2">If you see this page with ID: {testId}</p>
        <p className="text-lg mb-4">Then deployments ARE working!</p>
        <div className="bg-white text-gray-800 p-4 rounded mt-4">
          <p><strong>Test ID:</strong> {testId}</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          <p className="mt-4 text-sm">If this ID matches what's in the code, deployments are working correctly.</p>
        </div>
      </div>
      <div className="mt-4">
        <a href="/" className="text-purple-600 hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}
