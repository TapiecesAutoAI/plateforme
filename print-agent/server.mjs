import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const HOST = "127.0.0.1";
const PORT = 4317;

async function getPrinters() {
  const command = 'Get-Printer | Where-Object { $_.Name -ne "OneNote (Desktop)" -and $_.Name -ne "Microsoft Print to PDF" } | Select-Object Name,PortName,PrinterStatus,Type | ConvertTo-Json -Depth 3';
  const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command]);
  const parsed = JSON.parse(stdout || "[]");
  return Array.isArray(parsed) ? parsed : [parsed];
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    if (req.url === "/health") return res.end(JSON.stringify({ ok: true, service: "TPA Print Agent" }));
    if (req.url === "/printers") return res.end(JSON.stringify({ ok: true, printers: await getPrinters() }));
    if (req.url?.startsWith("/verify?")) {
      const url = new URL(req.url, `http://${HOST}:${PORT}`);
      const name = url.searchParams.get("name") ?? "";
      const printers = await getPrinters();
      const printer = printers.find((item) => item.Name === name);
      return res.end(JSON.stringify({ ok: Boolean(printer), printer: printer ?? null }));
    }
    if (req.url?.startsWith("/print-test?")) {
      const url = new URL(req.url, `http://${HOST}:${PORT}`);
      const name = url.searchParams.get("name") ?? "";
      const printers = await getPrinters();
      const printer = printers.find((item) => item.Name === name);
      if (!printer) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ ok: false, error: "PRINTER_NOT_FOUND" }));
      }
      const script = '& { param($printer) "TPA - TEST TICKET`r`nImprimante : $printer`r`nTest impression OK`r`n" | Out-Printer -Name $printer }';
      await execFileAsync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script, name]);
      return res.end(JSON.stringify({ ok: true, printer }));
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "NOT_FOUND" }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(error) }));
  }
});

server.listen(PORT, HOST, () => console.log(`TPA Print Agent http://${HOST}:${PORT}`));
