import { apiGet } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";

export default async function ApiProbePage() {
    let result;
    let error;

    try {
        result = await apiGet<any>("/health");
    } catch (err) {
        if (isApiError(err)) {
            error = `API ${err.status}: ${err.message}`;
        } else {
            error = err instanceof Error ? err.message : "Unknown error";
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">API Probe</h1>
            <p className="text-gray-600 mb-8">
                Development tool for testing API connectivity
            </p>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Backend Health Check</h2>

                {error ? (
                    <div className="space-y-2">
                        <p className="flex items-center gap-2">
                            <span className="text-red-500">❌</span>
                            API Connection Failed
                        </p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <p className="text-gray-600 text-sm">
                            Make sure the NestJS backend is running and accessible
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="flex items-center gap-2">
                            <span className="text-green-500">✅</span>
                            API Connection OK
                        </p>
                        <div className="bg-gray-50 p-4 rounded text-sm">
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}