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
        <SettingsIcon className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Default Citation Filter */}
        <Card className="panel border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Default Citation Filter
            </CardTitle>
            <CardDescription className="text-muted-foreground">
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
              <SelectTrigger className="w-40 bg-secondary border-border text-foreground">
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
          <Card className="panel border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Storage
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current data usage and storage backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backend badge */}
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-secondary-foreground">Backend:</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  storageInfo.backend === "IndexedDB"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-secondary-foreground"
                }`}>
                  {storageInfo.backend}
                </span>
              </div>

              {/* Usage bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-foreground">{storageInfo.totalSizeFormatted} used</span>
                  <span className="text-muted-foreground">{storageInfo.usagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${Math.min(storageInfo.usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Books</p>
                  <p className="text-lg font-semibold text-foreground">{storageInfo.totalBooks}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Citations</p>
                  <p className="text-lg font-semibold text-foreground">{storageInfo.totalCitations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clear All Data */}
        <Card className="panel border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Data</CardTitle>
            <CardDescription className="text-muted-foreground">
              Remove all stored books and reset settings to defaults.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-popover border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete all stored books and reset all
                    settings to their defaults. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border text-secondary-foreground hover:bg-secondary/80"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear search history
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-popover border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Clear search history?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete your recent search history.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearSearchHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
