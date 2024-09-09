"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  Download,
  RefreshCw,
  Wallet,
  Calendar,
  DollarSign,
  Network,
  ChevronDown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
interface Transaction {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: number;
}

interface Network {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

const networks: Network[] = [
  { id: "1", name: "Ethereum", symbol: "ETH", color: "#627EEA" },
  { id: "56", name: "Binance Smart Chain", symbol: "BNB", color: "#F3BA2F" },
  { id: "137", name: "Polygon", symbol: "MATIC", color: "#8247E5" },
  { id: "43114", name: "Avalanche", symbol: "AVAX", color: "#E84142" },
  { id: "10", name: "Optimism", symbol: "OP", color: "#FF0420" },
  { id: "42161", name: "Arbitrum", symbol: "ARB", color: "#28A0F0" },
  { id: "250", name: "Fantom", symbol: "FTM", color: "#1969FF" },
];

const TaxReporter: React.FC = () => {
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const [isInputVisible, setIsInputVisible] = useState(true);
  useEffect(() => {
    if (transactions?.length > 0) {
      const total = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.value) / 1e18,
        0
      );
      setTotalValue(total);
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://api.chainbase.online/v1/account/txs",
        {
          params: {
            chain_id: selectedNetwork.id,
            address: address,
            from_timestamp: Math.floor(startDate.getTime() / 1000),
            end_timestamp: Math.floor(endDate.getTime() / 1000),
          },
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_CHAINBASE_KEY,
          },
        }
      );
      setTransactions(response.data.data);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    const headers = [
      "Hash",
      "From",
      "To",
      `Value (${selectedNetwork.symbol})`,
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...transactions?.map((tx) =>
        [
          tx.transaction_hash,
          tx.from_address,
          tx.to_address,
          (parseFloat(tx.value) / 1e18).toString(),
          new Date(tx.block_timestamp).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedNetwork.name}_tax_report.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const chartData = transactions?.map((tx) => ({
    date: new Date(tx.block_timestamp).toLocaleDateString(),
    value: parseFloat(tx.value) / 1e18,
  }));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-bold mb-8 text-center text-indigo-800"
      >
        Crypto Tax Reporter
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setIsInputVisible(!isInputVisible)}
          >
            <CardTitle className="text-2xl flex items-center justify-between">
              <span className="flex items-center">
                <Network className="mr-2 text-indigo-600" />
                Enter Details
              </span>
              <ChevronDown
                className={`transform transition-transform ${
                  isInputVisible ? "rotate-180" : ""
                }`}
              />
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {isInputVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Wallet className="mr-2 text-indigo-600" />
                        <span className="text-lg font-semibold">
                          Wallet Address
                        </span>
                      </div>
                      <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter wallet address"
                        className="w-full border-2 border-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Network className="mr-2 text-indigo-600" />
                        <span className="text-lg font-semibold">Network</span>
                      </div>
                      <Select
                        onValueChange={(value) =>
                          setSelectedNetwork(
                            networks.find((n) => n.id === value) || networks[0]
                          )
                        }
                      >
                        <SelectTrigger className="w-full border-2 border-indigo-200 focus:border-indigo-500">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          {networks?.map((network) => (
                            <SelectItem key={network.id} value={network.id}>
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: network.color }}
                                ></div>
                                {network.name} ({network.symbol})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="mr-2 text-indigo-600" />
                        <span className="text-lg font-semibold">
                          Start Date
                        </span>
                      </div>
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date) => setStartDate(date)}
                        className="w-full p-2 border-2 border-indigo-200 rounded focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="mr-2 text-indigo-600" />
                        <span className="text-lg font-semibold">End Date</span>
                      </div>
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date) => setEndDate(date)}
                        className="w-full p-2 border-2 border-indigo-200 rounded focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={fetchTransactions}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                    >
                      {loading ? (
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        "Generate Report"
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {transactions === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="default" className="">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{`No transaction was found for the selected network ${selectedNetwork.name}`}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {transactions?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* ... (keep the existing stat cards) */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Wallet className="mr-2 text-indigo-600" />
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-700">
                  {transactions?.length ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <DollarSign className="mr-2 text-indigo-600" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-700">
                  {totalValue.toFixed(4)} {selectedNetwork.symbol}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Download className="mr-2 text-indigo-600" />
                  Download Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={downloadCSV}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                >
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="mb-8">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <TabsContent value="chart" key="chart">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Transaction Value Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={selectedNetwork.color}
                            fill={`url(#color${selectedNetwork.symbol})`}
                            fillOpacity={0.3}
                          />
                          <defs>
                            <linearGradient
                              id={`color${selectedNetwork.symbol}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={selectedNetwork.color}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={selectedNetwork.color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              <TabsContent value="table" key="table">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Transaction Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hash</TableHead>
                              <TableHead>From</TableHead>
                              <TableHead>To</TableHead>
                              <TableHead>
                                Value ({selectedNetwork.symbol})
                              </TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions?.map((tx, index) => (
                              <motion.tr
                                key={tx.transaction_hash}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                                className="hover:bg-indigo-50 transition-colors duration-200"
                              >
                                <TableCell className="font-mono">
                                  {tx.transaction_hash.slice(0, 10)}...
                                </TableCell>
                                <TableCell className="font-mono">
                                  {tx.from_address.slice(0, 10)}...
                                </TableCell>
                                <TableCell className="font-mono">
                                  {tx.to_address.slice(0, 10)}...
                                </TableCell>
                                <TableCell>
                                  {(parseFloat(tx.value) / 1e18).toFixed(4)}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    tx.block_timestamp
                                  ).toLocaleString()}
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
};

export default TaxReporter;
