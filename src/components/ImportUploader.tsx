import { useState } from "react";
import {
  Upload,
  FileText,
  Settings,
  Image,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { NavigationSidebar } from "./NavigationSidebar";
import { ImportService } from "../services/importService";

export default function ImportUploader() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [rulesFile, setRulesFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [importedTransactions, setImportedTransactions] = useState<Array<any> | null>(null);

  const handleUpload = async () => {
    if (!csvFile) {
      setMessage("Please select a CSV file.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await ImportService.uploadImport(
        csvFile,
        rulesFile || undefined
      );
      // Normalize response shapes and extract transactions
      const maybeTransactions =
        (res && res.transactions) ||
        (res && res.result && res.result.transactions) ||
        null;
      const createdCount =
        res?.created_count ?? res?.result?.created_count ?? res?.createdCount ?? null;

      if (Array.isArray(maybeTransactions) && maybeTransactions.length > 0) {
        setImportedTransactions(maybeTransactions);
        setMessage(`Imported ${createdCount ?? maybeTransactions.length} transactions`);
      } else if (createdCount !== null) {
        setImportedTransactions(null);
        setMessage(`Import successful: ${createdCount} transactions imported.`);
      } else {
        setImportedTransactions(null);
        setMessage(`Import successful.`);
      }
      setMessageType("success");
      // Reset files after successful upload
      setCsvFile(null);
      setRulesFile(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Import failed: ${errorMessage}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type: "csv" | "rules", file: File | null) => {
    if (type === "csv") {
      setCsvFile(file);
    } else {
      setRulesFile(file);
    }
    // Clear any existing messages when files change
    setMessage("");
    setMessageType("");
  };

  // Handler for receipt image input. If filename contains 'chitanta' we create mocked CSV rows and import them.
  const handleReceiptChange = async (file: File | null) => {
    setReceiptFile(file);
    setMessage("");
    setMessageType("");

    if (!file) return;
    const name = (file.name || "").toLowerCase();
    // Only trigger mocked import for the exact demo filenames `chitanta.jfif` or `chitanta2.jfif`
    if (name !== "chitanta.jfif" && name !== "chitanta2.jfif") {
      setMessage("Receipt import is demo-only and only works for files named 'chitanta.jfif' or 'chitanta2.jfif'.");
      setMessageType("error");
      return;
    }

    // build a mocked CSV payload from the receipt
    setLoading(true);
    try {
      // We'll support two mocked receipts. For the second one we optionally convert RON -> USD.
      let csvContent: string;

      if (name === "chitanta.jfif") {
        // First mocked receipt: convert amounts from RON -> USD (expenses)
        const convertToUSD = true;
        const RON_TO_USD = 0.22; // same conversion rate used for chitanta2

        const rows = [
          { date: '2025-10-08', desc: 'Garantie aluminiu', amt: 0.50 },
          { date: '2025-10-08', desc: 'Monster Golden', amt: 5.59 },
          { date: '2025-10-08', desc: 'File Somon ATM ASC', amt: 16.99 },
          { date: '2025-10-08', desc: 'Oua M*10 COD 2 SIMPL', amt: 10.19 },
        ];

        const header = 'date,description,amount,payee,tags';
        const body = rows
          .map((r) => {
            const amount = convertToUSD ? -(Math.round((r.amt * RON_TO_USD) * 100) / 100) : -r.amt;
            return `${r.date},${r.desc},${amount},Carrefour,other`;
          })
          .join('\n');

        csvContent = [header, body].join('\n');
      } else {
        // chitanta2.jfif - newer mocked receipt
        // Items (in RON): Garantie aluminiu 0.50, Garantie PET 0.50, PopCola Botanic 3.95, Dorna Apa Min 2.79
        // We'll treat them as expenses (negative amounts). Optionally convert to USD.
        const convertToUSD = true; // toggle conversion on import
        const RON_TO_USD = 0.22; // approximate conversion rate (1 RON -> 0.22 USD)

        const rows = [
          { date: '2025-10-04', desc: 'Garantie aluminiu', amt: 0.50 },
          { date: '2025-10-04', desc: 'Garantie PET', amt: 0.50 },
          { date: '2025-10-04', desc: 'PopCola Botanic 0.33', amt: 3.95 },
          { date: '2025-10-04', desc: 'Dorna Apa Min', amt: 2.79 },
        ];

        const header = 'date,description,amount,payee,tags';
        const body = rows
          .map((r) => {
            const amount = convertToUSD ? -(Math.round((r.amt * RON_TO_USD) * 100) / 100) : -r.amt;
            return `${r.date},${r.desc},${amount},Carrefour,other`;
          })
          .join('\n');

        csvContent = [header, body].join('\n');
      }

      const blob = new Blob([csvContent], { type: "text/csv" });
      const mockFile = new File([blob], "mock_chitanta_extracted.csv", { type: "text/csv" });

      const res = await ImportService.uploadImport(mockFile, undefined, true);
      const maybeTransactions =
        (res && res.transactions) ||
        (res && res.result && res.result.transactions) ||
        null;
      const createdCount =
        res?.created_count ?? res?.result?.created_count ?? res?.createdCount ?? null;

      if (Array.isArray(maybeTransactions) && maybeTransactions.length > 0) {
        setImportedTransactions(maybeTransactions);
        setMessage(`Receipt import successful: Imported ${createdCount ?? maybeTransactions.length} transactions`);
      } else if (createdCount !== null) {
        setImportedTransactions(null);
        setMessage(`Receipt import successful: ${createdCount} transactions imported.`);
      } else {
        setImportedTransactions(null);
        setMessage(`Receipt import successful.`);
      }
      setMessageType("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Receipt import failed: ${errorMessage}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Import Transactions
              </h1>
              <p className="text-gray-400">
                Upload CSV files and rules to import your transaction data
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="col-span-2">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-10">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Upload Section */}
              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-400" />
                  File Upload
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CSV File Upload (left) */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        CSV File
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Upload your transaction CSV file
                      </p>

                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) =>
                            handleFileChange("csv", e.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                        <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose CSV File
                        </span>
                      </label>

                      {csvFile && (
                        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                          <p className="text-green-400 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {csvFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rules File Upload (right) */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                      <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Rules File (Optional)
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Upload YAML or JSON rules for processing
                      </p>

                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".yaml,.yml,.json"
                          onChange={(e) =>
                            handleFileChange(
                              "rules",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                        />
                        <span className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Choose Rules File
                        </span>
                      </label>

                      {rulesFile && (
                        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                          <p className="text-green-400 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {rulesFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Upload - centered on its own row */}
                  <div className="md:col-span-2 flex justify-center">
                    <div className="w-full max-w-2xl border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-800 hover:border-yellow-500 transition-colors">
                      <Image className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Receipt Upload (Coming soon)
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Import photos of receipts to automatically extract data
                        (OCR + parsing — in progress)
                      </p>

                      <div className="inline-flex items-center space-x-3">
                        <label className="inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReceiptChange(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <span className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg inline-flex items-center transition-colors">
                            <Image className="w-4 h-4 mr-2" />
                            Choose Receipt
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={!csvFile || loading}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                      !csvFile || loading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Upload & Import
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    messageType === "success"
                      ? "bg-green-900 border-green-500"
                      : "bg-red-900 border-red-500"
                  }`}
                >
                  <div className="flex items-center">
                    {messageType === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    )}
                    <div>
                      <p
                        className={`${
                          messageType === "success"
                            ? "text-green-300"
                            : "text-red-300"
                        } font-medium`}
                      >
                        {message}
                      </p>
                      {importedTransactions && (
                        <ul className="mt-2 text-sm text-gray-200 list-disc list-inside">
                          {importedTransactions.map((t: any) => (
                            <li key={t.id}>
                              {t.date} • {t.description} • {typeof t.amount === 'number' ? t.amount.toFixed(2) : t.amount}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-indigo-400" />
                  Import Instructions
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      1
                    </div>
                    <p>
                      Select a CSV file containing your transaction data. The
                      file should include columns for date, description, amount,
                      and account information.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <p>
                      Optionally, upload a rules file (YAML or JSON) to define
                      how transactions should be categorized and processed.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <p>
                      Click "Upload & Import" to process your files. The system
                      will validate and import your transactions into the
                      appropriate accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
