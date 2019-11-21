const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

function localRequest(request) {
  return request.match(/src\/main\/webapp\/resources\/js/);
}

class i18nThymeleafWebpackPlugin {
  constructor(options) {
    this.options = options || {};
    this.functionName = this.options.functionName || "i18n";
    this.entries = {};
    this.i18nsByRequests = {};
  }

  apply(compiler) {
    compiler.hooks.emit.tap(
      "i18nPropertiesWebpackPlugin",
      compilation => {
        for ( const [ entrypointName, entrypoint ] of compilation.entrypoints.entries() ) {
          this.entries[entrypointName] = [];
          for ( const chunk of entrypoint.chunks ) {
            for ( const { userRequest } of chunk.modulesIterable ) {
              if ( userRequest != null && localRequest(userRequest) ) {
                this.entries[entrypointName].push(userRequest);
              }
            }
          }
        }
      }
    );

    compiler.hooks.normalModuleFactory.tap(
      "i18nPropertiesWebpackPlugin",
      factory => {
        factory.hooks.parser
          .for("javascript/auto")
          .tap("i18nPropertiesWebpackPlugin", parser => {
            parser.hooks.call
              .for(this.functionName)
              .tap("i18nPropertiesWebpackPlugin", expr => {
                /*
                Make sure an argument was passed to the function.
                 */
                if (expr.arguments.length) {
                  const key = expr.arguments[0].value;
                  this.i18nsByRequests[parser.state.module.userRequest] = this.i18nsByRequests[parser.state.module.userRequest] || {};
                  this.i18nsByRequests[parser.state.module.userRequest][key] = true;
                }
              });
          });
      }
    );

    /*
    Write the language files for each entry.
     */
    compiler.hooks.done.tap("i18nPropertiesWebpackPlugin", () => {
      const dir = path.join(compiler.options.output.path, "i18n");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.readFile(__dirname + "/i18n.html", "utf-8", (error, source) => {
        handlebars.registerHelper('tl', key => `/*[[#{${key}}]]*/ ""`);
        handlebars.registerHelper("id", bundle => `id="${bundle.replace("/", "-")}-translations"`);
        const template = handlebars.compile(source);

        Object.keys(this.entries).forEach(entry => {
          let keys = {};

          this.entries[entry].forEach(request => {
            if (request in this.i18nsByRequests) {
              Object.assign(keys, Object.keys(this.i18nsByRequests[request]));
            }
          });

          if (Object.keys(keys).length > 0) {
              const html = template({ keys, entry });
              fs.writeFileSync(path.join(dir, `${entry}.html`), html);
              const entryPath = path.join(dir, `${entry}.html`);
              if (!fs.existsSync(path.dirname(entryPath))) {
                fs.mkdirSync(path.dirname(entryPath), { recursive: true });
              }
              fs.writeFileSync(entryPath, html);
          }
        });
      });
    });
  }
}

module.exports = i18nThymeleafWebpackPlugin;
