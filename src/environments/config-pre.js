const fsWrite = require("fs").writeFile;
const { Observable } = require("rxjs");
const process = require('process');

module.exports = function(ctx)
{
  if (process.env.DEVELOP_CLOUD_URL === undefined  || process.env.STAGING_CLOUD_URL === undefined ||
      process.env.MASTER_CLOUD_URL === undefined) {
    return;
  }

  const pathDevelop = "./src/environments/develop.ts";
  const pathStaging = "./src/environments/staging.ts";
  const pathWeb     = "./src/environments/www.ts";
  let exec = require("child_process").exec;
  const revision = new Observable(s =>
  {
    exec("git rev-parse HEAD", function(error, stdout, stderr)
    {
      if (error !== null) console.log("git error: " + error + stderr);
      s.next(stdout.toString().trim());
      s.complete();
    });
  });
  revision.subscribe(function(res)
  {
    const envDevelop = `export const environment =
      {
        apiUrl:         "${process.env.API_DEVELOP_URL}",
        cloudDomain:    "${process.env.DEVELOP_CLOUD_URL}",
        cloudAssets:    "${process.env.DEVELOP_CLOUD_URL}${res}/assets",
        production:     "false",
        appEnviroment:  "develop",
        gitSha:         "${res}"
      };
    `;
    const envStaging = `export const environment =
      {
        apiUrl:         "${process.env.API_STAGING_URL}",
        cloudDomain:    "${process.env.STAGING_CLOUD_URL}",
        cloudAssets:    "${process.env.STAGING_CLOUD_URL}${res}/assets",
        production:     "false",
        appEnviroment:  "staging",
        gitSha:         "${res}"
      };
    `;
    const envWeb = `export const environment =
      {
        apiUrl:         "${process.env.API_URL}",
        cloudDomain:    "${process.env.MASTER_CLOUD_URL}",
        cloudAssets:    "${process.env.MASTER_CLOUD_URL}${res}/assets",
        production:     "true",
        appEnviroment:  "production",
        gitSha:         "${res}"
      };
    `;
    fsWrite(pathDevelop, envDevelop, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envDevelop});
      }
    });
    fsWrite(pathStaging, envStaging, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envStaging});
      }
    });
    fsWrite(pathWeb, envWeb, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envWeb});
      }
    });
  });
};
