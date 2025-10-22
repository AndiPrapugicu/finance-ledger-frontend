import React, { useState } from "react";
import { Terminal, Download, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../constants/api";

interface CommandOption {
  flag: string;
  description: string;
  values?: string[];
}

const COMMAND_OPTIONS: CommandOption[] = [
  {
    flag: "--format",
    description: "Export format",
    values: ["csv", "markdown"],
  },
  { flag: "--from", description: "Start date (YYYY-MM-DD)" },
  { flag: "--to", description: "End date (YYYY-MM-DD)" },
  { flag: "--account", description: "Filter by account" },
  { flag: "--tag", description: "Filter by tag" },
];

export const ReportCLI: React.FC = () => {
  const [command, setCommand] = useState("report");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCommand(input);
    setError("");

    const args = input.split(" ");
    const currentArg = args[args.length - 1];

    if (currentArg.startsWith("--")) {
      const matches = COMMAND_OPTIONS.map((opt) => opt.flag).filter((flag) =>
        flag.startsWith(currentArg)
      );
      setSuggestions(matches);
    } else if (currentArg.length > 0) {
      const lastFlag = args[args.length - 2];
      const option = COMMAND_OPTIONS.find((opt) => opt.flag === lastFlag);
      if (option?.values) {
        const matches = option.values.filter((v) => v.startsWith(currentArg));
        setSuggestions(matches);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const args = command.split(" ");
      const format =
        args.find((arg) => arg.startsWith("--format"))?.split("=")[1] || "csv";
      const params = new URLSearchParams();

      args.forEach((arg) => {
        if (arg.startsWith("--")) {
          const [flag, value] = arg.split("=");
          if (value && flag !== "--format") {
            // Don't add format to params since it's in the URL path
            params.append(flag.replace("--", ""), value);
          }
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/reports/export/${format}/?${params}`
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions.${format}`;
      a.click();
    } catch (err) {
      setError("Failed to generate report. Please check your command syntax.");
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Terminal className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">
            Command Line Export
          </h2>
          <p className="text-gray-400">Generate reports using CLI commands</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-green-500 font-mono">$</span>
            <input
              type="text"
              value={command}
              onChange={handleCommandChange}
              className="bg-transparent text-white flex-1 outline-none font-mono"
              placeholder="report --format=csv --from=2024-01-01"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 border-t border-gray-700 pt-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="text-gray-300 cursor-pointer hover:bg-gray-800 px-3 py-1 rounded font-mono"
                  onClick={() => {
                    const args = command.split(" ");
                    args[args.length - 1] = suggestion;
                    setCommand(args.join(" "));
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <span className="font-semibold">Tip:</span> Use tab completion for
            available options
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Available Commands
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {COMMAND_OPTIONS.map((opt) => (
            <div key={opt.flag} className="bg-gray-900/50 p-3 rounded-lg">
              <code className="text-blue-400 font-mono">{opt.flag}</code>
              {opt.values && (
                <span className="text-gray-500 text-sm">
                  {" "}
                  [{opt.values.join("|")}]
                </span>
              )}
              <p className="text-gray-400 text-sm mt-1">{opt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
