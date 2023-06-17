/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./server.js":
/*!*******************!*\
  !*** ./server.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const express = __webpack_require__(/*! express */ \"express\");\n(__webpack_require__(/*! dotenv */ \"dotenv\").config)();\nconst PORT = process.env.PORT || 3000;\nconst HOST = process.env.URL || 'http://locahost';\nconst bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\nconst app = express();\nconst http = __webpack_require__(/*! http */ \"http\");\nconst server = http.createServer(app);\nconst {\n  reqHandle,\n  errorHandle,\n  logEvents\n} = __webpack_require__(/*! ./src/middlewares/logEvents */ \"./src/middlewares/logEvents.js\");\nconst STATUS_TIME = new Date(Date.now() + 7 * 60 * 60 * 1000).toUTCString();\nglobal._STATUS_TIME = STATUS_TIME;\n//INIT NODEJS\napp.use(express.static(__dirname + \"/public\"));\napp.set(\"view engine\", \"ejs\");\napp.set(\"views\", \"./views\");\napp.use('/images', express.static('images'));\napp.use(bodyParser.urlencoded({\n  extended: false\n}));\napp.use(bodyParser.json());\nconst cookieParser = __webpack_require__(/*! cookie-parser */ \"cookie-parser\");\napp.use(cookieParser());\napp.use(reqHandle);\napp.use(errorHandle);\n// port\nserver.listen(PORT, () => {\n   false ? 0 : false;\n  console.log(`Server run on PORT ${PORT}`);\n});\nconst Router = __webpack_require__(/*! ./src/routers/routers */ \"./src/routers/routers.js\");\napp.use(Router);\n\n//# sourceURL=webpack://muzik-fe-project/./server.js?");

/***/ }),

/***/ "./src/middlewares/logEvents.js":
/*!**************************************!*\
  !*** ./src/middlewares/logEvents.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const {\n  format\n} = __webpack_require__(/*! date-fns */ \"date-fns\");\nconst {\n  v4: uuid\n} = __webpack_require__(/*! uuid */ \"uuid\");\nconst fs = __webpack_require__(/*! fs */ \"fs\");\nconst fsPromise = (__webpack_require__(/*! fs */ \"fs\").promises);\nconst path = __webpack_require__(/*! path */ \"path\");\nconst {\n  vi\n} = __webpack_require__(/*! date-fns/locale */ \"date-fns/locale\");\nconst logEvents = async (message, typeLog) => {\n  const currentDate = `${format(new Date(), 'dd-MM-yyyy')}`;\n  const dateTime = `${currentDate}${format(new Date(), '\\tHH:mm:ss O', {\n    locale: vi\n  })}`;\n  const logItem = `${dateTime}\\t${uuid()}\\t${message}\\n`;\n  try {\n    if (!fs.existsSync(path.join(__dirname, '../..', 'logs', typeLog))) {\n      if (!fs.existsSync(path.join(__dirname, '../..', 'logs'))) {\n        await fsPromise.mkdir(path.join(__dirname, '../..', 'logs'));\n      }\n      await fsPromise.mkdir(path.join(__dirname, '../..', 'logs', typeLog));\n    }\n    return await fsPromise.appendFile(path.join(__dirname, '../..', 'logs', typeLog, currentDate + \".txt\"), logItem);\n  } catch (error) {\n    console.log(error);\n  }\n};\nconst reqHandle = (req, res, next) => {\n   false ? 0 : console.log(`${req.headers.origin || 'localhost'} ${req.method} ${req.path}`);\n  next();\n};\nconst errorHandle = (error, req, res, next) => {\n   false ? 0 : console.log(`${req.headers.origin || 'localhost'} ${req.method} ${req.path}\\t${error.name}: ${error.message}`);\n  res.status(500).json(`${error.name}: ${error.message}`);\n};\nmodule.exports = {\n  reqHandle,\n  errorHandle,\n  logEvents\n};\n\n//# sourceURL=webpack://muzik-fe-project/./src/middlewares/logEvents.js?");

/***/ }),

/***/ "./src/routers/routers.js":
/*!********************************!*\
  !*** ./src/routers/routers.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const express = __webpack_require__(/*! express */ \"express\");\nconst router = express.Router();\n\n// Endpoints\nrouter.get('/home', (req, res) => {\n  res.status(200).render(\"home\");\n});\nrouter.all('/*', (req, res) => {\n  res.sendStatus(404);\n});\nmodule.exports = router;\n\n//# sourceURL=webpack://muzik-fe-project/./src/routers/routers.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("cookie-parser");

/***/ }),

/***/ "date-fns":
/*!***************************!*\
  !*** external "date-fns" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("date-fns");

/***/ }),

/***/ "date-fns/locale":
/*!**********************************!*\
  !*** external "date-fns/locale" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("date-fns/locale");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("uuid");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./server.js");
/******/ 	
/******/ })()
;