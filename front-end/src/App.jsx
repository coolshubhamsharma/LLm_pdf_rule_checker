import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [pdf, setPdf] = useState(null);
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!pdf) return alert("Please upload a PDF");

    setLoading(true);
    setResults([]);

    const form = new FormData();
    form.append("pdf", pdf);
    form.append("rules", JSON.stringify(rules));

    try {
      const res = await fetch("http://localhost:3000/api/check", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Error checking document");
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-200 p-6 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-3xl backdrop-blur-xl bg-white/60 shadow-2xl rounded-2xl p-8 border border-white/30"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Title */}
        <motion.h1
          className="text-3xl font-extrabold text-center text-blue-700 tracking-wide mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          PDF Rule Checker
        </motion.h1>

        {/* Upload */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">Upload PDF</label>
          <motion.input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setPdf(e.target.files[0])}
            className="hover:cursor-pointer mt-2 w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow-sm hover:border-blue-500 transition"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          />
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {rules.map((r, i) => (
            <motion.input
              key={i}
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              placeholder={`Enter Rule ${i + 1}`}
              value={r}
              onChange={(e) => {
                const newRules = [...rules];
                newRules[i] = e.target.value;
                setRules(newRules);
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          onClick={handleCheck}
          disabled={loading}
          className={`hover:cursor-pointer w-full mt-6 p-4 rounded-xl text-white font-semibold shadow-lg transition-all
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
        >
          {loading ? "Checking..." : "Check Document"}
        </motion.button>

        {/* Spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex justify-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div
              className="mt-8 overflow-x-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.table
                className="w-full border border-gray-300 rounded-xl shadow-xl bg-white"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left border-r border-white/30">Rule</th>
                    <th className="p-3 text-left border-r border-white/30">Status</th>
                    <th className="p-3 text-left border-r border-white/30">Evidence</th>
                    <th className="p-3 text-left border-r border-white/30">Reasoning</th>
                    <th className="p-3 text-left">Confidence</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((r, i) => (
                    <motion.tr
                      key={i}
                      className="border-b border-gray-200 hover:bg-blue-50 transition"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <td className="p-3 border-r border-gray-200">{r.rule}</td>
                      <td
                        className={`p-3 font-bold border-r border-gray-200 ${
                          r.status === "pass" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </td>
                      <td className="p-3 border-r border-gray-200">{r.evidence}</td>
                      <td className="p-3 border-r border-gray-200">{r.reasoning}</td>
                      <td className="p-3">{r.confidence}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default App;
