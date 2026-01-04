// Test page to verify deployments are working
// This file will show a timestamp that changes with each deployment

export default function TestDeploymentPage() {
  const deploymentTime = process.env.NEXT_PUBLIC_DEPLOYMENT_TIME || new Date().toISOString();
  const buildId = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown';
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Deployment Test Page</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <h2 className="text-xl font-semibold">✅ If you can see this page, the deployment is working!</h2>
        </div>
        <div className="space-y-2">
          <p><strong>Last Updated:</strong> {new Date(deploymentTime).toLocaleString()}</p>
          <p><strong>Build ID:</strong> {buildId.substring(0, 7)}</p>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">How to verify deployments:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Push a new commit</li>
            <li>Wait for Vercel to deploy</li>
            <li>Refresh this page - the "Last Updated" time should change</li>
          </ol>
        </div>
        <div className="mt-4">
          <a href="/" className="text-purple-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
