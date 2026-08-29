import fs from "node:fs";
import path from "node:path";
import {
  execFileSync,
} from "node:child_process";


const ROOT =
  process.cwd();


const EXTENSIONS =
  new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".json",
    ".css",
    ".md",
  ]);


/*
 * Files that must never participate
 * in the production encoding check.
 */
function isBackupFile(
  file,
) {

  const name =
    file.toLowerCase();

  return (
    name.includes(".bak") ||
    name.includes(".backup") ||
    name.includes(".before-") ||
    name.includes("encoding-backup") ||
    name.endsWith(".tmp") ||
    name.endsWith(".temp") ||
    name.endsWith(".orig")
  );
}


/*
 * Get only files that are:
 *
 * - tracked by Git
 * - or new and not ignored
 *
 * Therefore old local backups ignored by Git
 * cannot block the application.
 */
function getProjectFiles() {

  const output =
    execFileSync(
      "git",
      [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        ".",
      ],
      {
        cwd:
          ROOT,

        encoding:
          "utf8",
      },
    );


  return output
    .split(
      /\r?\n/,
    )
    .map(
      value =>
        value.trim(),
    )
    .filter(
      Boolean,
    )
    .map(
      relative =>
        path.resolve(
          ROOT,
          relative,
        ),
    )
    .filter(
      file =>
        fs.existsSync(
          file,
        ),
    )
    .filter(
      file =>
        EXTENSIONS.has(
          path.extname(
            file,
          ),
        ),
    )
    .filter(
      file =>
        !isBackupFile(
          file,
        ),
    );
}


/*
 * Real mojibake signatures.
 *
 * Numeric construction avoids introducing
 * corrupted Unicode directly in this script.
 */
function containsMojibake(
  line,
) {

  const replacement =
    String.fromCodePoint(
      0xfffd,
    );

  if (
    line.includes(
      replacement,
    )
  ) {
    return true;
  }


  /*
   * C3 + typical second mojibake character.
   */
  const c3 =
    String.fromCodePoint(
      0x00c3,
    );

  const c2 =
    String.fromCodePoint(
      0x00c2,
    );

  const latinA =
    String.fromCodePoint(
      0x0192,
    );


  if (
    line.includes(
      c3 + latinA,
    )
  ) {
    return true;
  }


  /*
   * Common double-encoding prefixes.
   */
  if (
    line.includes(
      c3 + c2,
    )
  ) {
    return true;
  }


  /*
   * Detect classic UTF8 decoded as CP1252:
   * C3 followed by characters in the
   * 0x80-0xBF range.
   */
  for (
    let i = 0;
    i < line.length - 1;
    i++
  ) {

    const first =
      line.codePointAt(
        i,
      );

    const second =
      line.codePointAt(
        i + 1,
      );


    if (
      first === 0x00c3 &&
      second >= 0x0080 &&
      second <= 0x00bf
    ) {
      return true;
    }


    if (
      first === 0x00c2 &&
      second >= 0x0080 &&
      second <= 0x00bf
    ) {
      return true;
    }
  }


  /*
   * Additional mojibake code points observed
   * in historical project corruption.
   *
   * Numeric construction keeps corrupted
   * Unicode out of this checker source.
   *
   * U+01F8
   * U+01E6
   * U+01E9
   */
  const knownCorruptedCodePoints =
    new Set([
      0x01f8,
      0x01e6,
      0x01e9,
    ]);

  for (
    const character
    of line
  ) {

    if (
      knownCorruptedCodePoints.has(
        character.codePointAt(
          0,
        ),
      )
    ) {
      return true;
    }
  }


  return false;
}


const files =
  getProjectFiles();


const failures =
  [];


for (
  const file
  of files
) {

  const text =
    fs.readFileSync(
      file,
      "utf8",
    );


  const lines =
    text.split(
      /\r?\n/,
    );


  lines.forEach(
    (
      line,
      index,
    ) => {

      if (
        containsMojibake(
          line,
        )
      ) {

        failures.push({
          file:
            path.relative(
              ROOT,
              file,
            ),

          line:
            index + 1,

          preview:
            line
              .trim()
              .slice(
                0,
                180,
              ),
        });
      }
    },
  );
}


if (
  failures.length > 0
) {

  for (
    const failure
    of failures
  ) {

    console.error(
      `${failure.file}:${failure.line}`,
    );

    console.error(
      `  ${failure.preview}`,
    );
  }


  console.error("");

  console.error(
    `ENCODING CHECK FAILED: ${failures.length} active mojibake line(s).`,
  );

  process.exit(
    1,
  );
}


console.log(
  `ENCODING CHECK OK: ${files.length} active project files checked.`,
);
