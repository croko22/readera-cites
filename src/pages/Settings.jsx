import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Trash2, Database, HardDrive } from "lucide-react";
import {
  getSettings,
  setSettings,
  clearAllData,
  getStorageInfo,
  clearSearchHistory,
} from "@/lib/booksStorage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FILTER_OPTIONS = [0, 10, 50, 100, 200];

export const Settings = () => {
  const [settings, setLocalSettings] = useState({
    defaultFilter: 0,
    theme: "dark",
  });
  const [storageInfo, setStorageInfo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getSettings(), getStorageInfo()]).then(([s, info]) => {
      setLocalSettings(s);
      setStorageInfo(info);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(
    (partial) => {
      const next = { ...settings, ...partial };
      setLocalSettings(next);
      setSettings(next);
    },
    [settings]
  );

  const handleClearAll = useCallback(async () => {
    await clearAllData();
    navigate("/");
  }, [navigate]);

  if (!loaded) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-7">
      <div className="mb-6 flex items-center gap-3">
        <SettingsIcon className="h-7 w-7 text-amber-500" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Default Citation Filter */}
        <Card className="panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">
              Default Citation Filter
            </CardTitle>
            <CardDescription className="text-slate-400">
              Minimum citations per book used as the initial filter when
              uploading a new library file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={String(settings.defaultFilter)}
              onValueChange={(val) =>
                updateSettings({ defaultFilter: Number(val) })
              }
            >
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt === 0 ? "No minimum" : `${opt}+`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Storage Info */}
        {storageInfo && storageInfo.backend !== "none" && (
          <Card className="panel border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-amber-500" />
                Storage
              </CardTitle>
              <CardDescription className="text-slate-400">
                Current data usage and storage backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backend badge */}
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">Backend:</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  storageInfo.backend === "IndexedDB"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                }`}>
                  {storageInfo.backend}
                </span>
              </div>

              {/* Usage bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{storageInfo.totalSizeFormatted} used</span>
                  <span className="text-slate-500">{storageInfo.usagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{ width: `${Math.min(storageInfo.usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500">Books</p>
                  <p className="text-lg font-semibold text-slate-100">{storageInfo.totalBooks}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500">Citations</p>
                  <p className="text-lg font-semibold text-slate-100">{storageInfo.totalCitations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clear All Data */}
        <Card className="panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">Data</CardTitle>
            <CardDescription className="text-slate-400">
              Remove all stored books and reset settings to defaults.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1A1A24] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-100">Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This will permanently delete all stored books and reset all
                    settings to their defaults. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white">
                    Clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear search history
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1A1A24] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-100">Clear search history?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This will permanently delete your recent search history.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearSearchHistory} className="bg-amber-600 hover:bg-amber-700 text-white">
                    Clear history
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
