(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var createCapacitorPlatforms, initPlatforms, CapacitorPlatforms, addPlatform, setPlatform, ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, Plugins, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      createCapacitorPlatforms = (win) => {
        const defaultPlatformMap = /* @__PURE__ */ new Map();
        defaultPlatformMap.set("web", { name: "web" });
        const capPlatforms = win.CapacitorPlatforms || {
          currentPlatform: { name: "web" },
          platforms: defaultPlatformMap
        };
        const addPlatform2 = (name, platform) => {
          capPlatforms.platforms.set(name, platform);
        };
        const setPlatform2 = (name) => {
          if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
          }
        };
        capPlatforms.addPlatform = addPlatform2;
        capPlatforms.setPlatform = setPlatform2;
        return capPlatforms;
      };
      initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
      CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      addPlatform = CapacitorPlatforms.addPlatform;
      setPlatform = CapacitorPlatforms.setPlatform;
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins2 = cap.Plugins = cap.Plugins || {};
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== "web";
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => {
          var _a2;
          return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
        };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
          return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = /* @__PURE__ */ new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a2, _b2;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
              }
            } else if (impl) {
              return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins2[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([
              ...Object.keys(jsImplementations),
              ...pluginHeader ? [platform] : []
            ])
          });
          return proxy;
        };
        const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      Plugins = Capacitor.Plugins;
      WebPlugin = class {
        constructor(config) {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
          if (config) {
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
          }
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          this.listeners[eventName].splice(index, 1);
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    LocalNotificationsWeb: () => LocalNotificationsWeb
  });
  var LocalNotificationsWeb;
  var init_web = __esm({
    "node_modules/@capacitor/local-notifications/dist/esm/web.js"() {
      init_dist();
      LocalNotificationsWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.pending = [];
          this.deliveredNotifications = [];
          this.hasNotificationSupport = () => {
            if (!("Notification" in window) || !Notification.requestPermission) {
              return false;
            }
            if (Notification.permission !== "granted") {
              try {
                new Notification("");
              } catch (e) {
                if (e.name == "TypeError") {
                  return false;
                }
              }
            }
            return true;
          };
        }
        async getDeliveredNotifications() {
          const deliveredSchemas = [];
          for (const notification of this.deliveredNotifications) {
            const deliveredSchema = {
              title: notification.title,
              id: parseInt(notification.tag),
              body: notification.body
            };
            deliveredSchemas.push(deliveredSchema);
          }
          return {
            notifications: deliveredSchemas
          };
        }
        async removeDeliveredNotifications(delivered) {
          for (const toRemove of delivered.notifications) {
            const found = this.deliveredNotifications.find((n) => n.tag === String(toRemove.id));
            found === null || found === void 0 ? void 0 : found.close();
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !found);
          }
        }
        async removeAllDeliveredNotifications() {
          for (const notification of this.deliveredNotifications) {
            notification.close();
          }
          this.deliveredNotifications = [];
        }
        async createChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async deleteChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async listChannels() {
          throw this.unimplemented("Not implemented on web.");
        }
        async schedule(options) {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          for (const notification of options.notifications) {
            this.sendNotification(notification);
          }
          return {
            notifications: options.notifications.map((notification) => ({
              id: notification.id
            }))
          };
        }
        async getPending() {
          return {
            notifications: this.pending
          };
        }
        async registerActionTypes() {
          throw this.unimplemented("Not implemented on web.");
        }
        async cancel(pending) {
          this.pending = this.pending.filter((notification) => !pending.notifications.find((n) => n.id === notification.id));
        }
        async areEnabled() {
          const { display } = await this.checkPermissions();
          return {
            value: display === "granted"
          };
        }
        async changeExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async checkExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async requestPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(await Notification.requestPermission());
          return { display };
        }
        async checkPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(Notification.permission);
          return { display };
        }
        transformNotificationPermission(permission) {
          switch (permission) {
            case "granted":
              return "granted";
            case "denied":
              return "denied";
            default:
              return "prompt";
          }
        }
        sendPending() {
          var _a;
          const toRemove = [];
          const now = (/* @__PURE__ */ new Date()).getTime();
          for (const notification of this.pending) {
            if (((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) && notification.schedule.at.getTime() <= now) {
              this.buildNotification(notification);
              toRemove.push(notification);
            }
          }
          this.pending = this.pending.filter((notification) => !toRemove.find((n) => n === notification));
        }
        sendNotification(notification) {
          var _a;
          if ((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) {
            const diff = notification.schedule.at.getTime() - (/* @__PURE__ */ new Date()).getTime();
            this.pending.push(notification);
            setTimeout(() => {
              this.sendPending();
            }, diff);
            return;
          }
          this.buildNotification(notification);
        }
        buildNotification(notification) {
          const localNotification = new Notification(notification.title, {
            body: notification.body,
            tag: String(notification.id)
          });
          localNotification.addEventListener("click", this.onClick.bind(this, notification), false);
          localNotification.addEventListener("show", this.onShow.bind(this, notification), false);
          localNotification.addEventListener("close", () => {
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !this);
          }, false);
          this.deliveredNotifications.push(localNotification);
          return localNotification;
        }
        onClick(notification) {
          const data = {
            actionId: "tap",
            notification
          };
          this.notifyListeners("localNotificationActionPerformed", data);
        }
        onShow(notification) {
          this.notifyListeners("localNotificationReceived", notification);
        }
      };
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor/local-notifications/dist/esm/definitions.js
  var Weekday;
  (function(Weekday2) {
    Weekday2[Weekday2["Sunday"] = 1] = "Sunday";
    Weekday2[Weekday2["Monday"] = 2] = "Monday";
    Weekday2[Weekday2["Tuesday"] = 3] = "Tuesday";
    Weekday2[Weekday2["Wednesday"] = 4] = "Wednesday";
    Weekday2[Weekday2["Thursday"] = 5] = "Thursday";
    Weekday2[Weekday2["Friday"] = 6] = "Friday";
    Weekday2[Weekday2["Saturday"] = 7] = "Saturday";
  })(Weekday || (Weekday = {}));

  // node_modules/@capacitor/local-notifications/dist/esm/index.js
  var LocalNotifications = registerPlugin("LocalNotifications", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.LocalNotificationsWeb())
  });

  // scripts/wakeLock.src.js
  init_dist();
  var logHistory = [];
  var MAX_LOGS = 500;
  function captureLog(level, ...args) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const message = args.map((a) => {
      if (typeof a === "object") {
        try {
          return JSON.stringify(a, null, 2);
        } catch (e) {
          return String(a);
        }
      }
      return String(a);
    }).join(" ");
    const entry = { timestamp, level, message };
    logHistory.push(entry);
    if (logHistory.length > MAX_LOGS) {
      logHistory.shift();
    }
    const prefix = "\u{1F514} [NotificationDebug]";
    if (level === "error") {
      console.error(prefix, timestamp, ...args);
    } else if (level === "warn") {
      console.warn(prefix, timestamp, ...args);
    } else {
      console.log(prefix, timestamp, ...args);
    }
  }
  function logInfo(...args) {
    captureLog("info", ...args);
  }
  function logWarn(...args) {
    captureLog("warn", ...args);
  }
  function logError(...args) {
    captureLog("error", ...args);
  }
  function createLogViewer() {
    const existing = document.getElementById("debug-log-viewer");
    if (existing)
      existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "debug-log-viewer";
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    color: #0f0;
    font-family: monospace;
    font-size: 11px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
  `;
    const header = document.createElement("div");
    header.style.cssText = `
    padding: 10px;
    background: #222;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  `;
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "CLOSE";
    closeBtn.style.cssText = "padding: 8px 16px; background: #c00; color: white; border: none; border-radius: 4px;";
    closeBtn.onclick = () => overlay.remove();
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPY ALL";
    copyBtn.style.cssText = "padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;";
    copyBtn.onclick = () => {
      const text = logHistory.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join("\n");
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "COPIED!";
        setTimeout(() => copyBtn.textContent = "COPY ALL", 2e3);
      }).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        copyBtn.textContent = "COPIED!";
        setTimeout(() => copyBtn.textContent = "COPY ALL", 2e3);
      });
    };
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "CLEAR";
    clearBtn.style.cssText = "padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px;";
    clearBtn.onclick = () => {
      logHistory.length = 0;
      refreshLogs();
    };
    const testBtn = document.createElement("button");
    testBtn.textContent = "TEST 5s";
    testBtn.style.cssText = "padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px;";
    testBtn.onclick = async () => {
      testBtn.textContent = "WAIT...";
      await window.notificationManager.schedule(5, "Test Timer", "Fired after 5 seconds");
      testBtn.textContent = "SENT!";
      setTimeout(() => testBtn.textContent = "TEST 5s", 2e3);
    };
    const channelBtn = document.createElement("button");
    channelBtn.textContent = "LIST CH";
    channelBtn.style.cssText = "padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px;";
    channelBtn.onclick = () => listNotificationChannels();
    const permBtn = document.createElement("button");
    permBtn.textContent = "PERMS";
    permBtn.style.cssText = "padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px;";
    permBtn.onclick = () => checkAndLogPermissions();
    header.appendChild(closeBtn);
    header.appendChild(copyBtn);
    header.appendChild(clearBtn);
    header.appendChild(testBtn);
    header.appendChild(channelBtn);
    header.appendChild(permBtn);
    const countDiv = document.createElement("div");
    countDiv.style.cssText = "padding: 5px 10px; background: #333; color: #aaa;";
    countDiv.id = "log-count";
    const logContent = document.createElement("pre");
    logContent.style.cssText = `
    flex: 1;
    overflow: auto;
    padding: 10px;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  `;
    logContent.id = "log-content";
    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function refreshLogs() {
      const content = document.getElementById("log-content");
      const count = document.getElementById("log-count");
      if (content) {
        content.innerHTML = logHistory.map((l) => {
          const color = l.level === "error" ? "#f00" : l.level === "warn" ? "#ff0" : "#0f0";
          return `<span style="color:${color}">[${l.timestamp.split("T")[1]}] [${l.level.toUpperCase()}]</span> ${escapeHtml(l.message)}`;
        }).join("\n");
        content.scrollTop = content.scrollHeight;
      }
      if (count) {
        count.textContent = `${logHistory.length} entries | Tap COPY ALL to export`;
      }
    }
    overlay.appendChild(header);
    overlay.appendChild(countDiv);
    overlay.appendChild(logContent);
    document.body.appendChild(overlay);
    refreshLogs();
    const intervalId = setInterval(() => {
      if (document.getElementById("debug-log-viewer")) {
        refreshLogs();
      } else {
        clearInterval(intervalId);
      }
    }, 500);
  }
  logInfo("============================================================");
  logInfo("NOTIFICATION SERVICE INITIALIZING");
  logInfo("============================================================");
  logInfo("Platform:", Capacitor.getPlatform());
  logInfo("Is Native:", Capacitor.isNativePlatform());
  logInfo("User Agent:", navigator.userAgent);
  async function setupNotificationListeners() {
    if (!Capacitor.isNativePlatform()) {
      logInfo("Skipping native listeners - web platform");
      return;
    }
    try {
      logInfo("Setting up notification listeners...");
      await LocalNotifications.addListener("localNotificationReceived", (notification) => {
        logInfo(">>> EVENT: localNotificationReceived <<<");
        logInfo("Notification data:", notification);
      });
      logInfo("\u2713 localNotificationReceived listener added");
      await LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
        logInfo(">>> EVENT: localNotificationActionPerformed <<<");
        logInfo("Action data:", action);
      });
      logInfo("\u2713 localNotificationActionPerformed listener added");
    } catch (err) {
      logError("Listener setup failed:", err.message, err.stack);
    }
  }
  setupNotificationListeners();
  async function checkAndLogPermissions() {
    if (!Capacitor.isNativePlatform()) {
      logInfo("Skipping permission check - web platform");
      return;
    }
    try {
      logInfo("Checking permissions...");
      const status = await LocalNotifications.checkPermissions();
      logInfo("Permission status:", status);
      try {
        const exact = await LocalNotifications.checkExactNotificationSetting();
        logInfo("Exact alarm setting:", exact);
      } catch (e) {
        logWarn("checkExactNotificationSetting error:", e.message);
      }
    } catch (err) {
      logError("Permission check failed:", err.message);
    }
  }
  checkAndLogPermissions();
  async function listNotificationChannels() {
    if (!Capacitor.isNativePlatform())
      return;
    try {
      logInfo("Listing notification channels...");
      const result = await LocalNotifications.listChannels();
      logInfo("Channels result:", result);
      if (!result.channels || result.channels.length === 0) {
        logWarn("*** NO CHANNELS FOUND - THIS MAY BE THE PROBLEM ***");
      } else {
        result.channels.forEach((ch, i) => {
          logInfo(`Channel[${i}]: id="${ch.id}" name="${ch.name}" importance=${ch.importance} sound="${ch.sound}"`);
        });
      }
    } catch (err) {
      logError("listChannels failed:", err.message);
    }
  }
  listNotificationChannels();
  var webTimer = null;
  window.wakeLockManager = {
    wakeLock: null,
    request: async function() {
      logInfo("Wake Lock request");
      try {
        if ("wakeLock" in navigator) {
          this.wakeLock = await navigator.wakeLock.request("screen");
          logInfo("\u2713 Wake Lock acquired");
          this.wakeLock.addEventListener("release", () => logInfo("Wake Lock released"));
          return true;
        }
        logWarn("Wake Lock not supported");
        return false;
      } catch (err) {
        logError("Wake Lock failed:", err.message);
        return false;
      }
    },
    release: async function() {
      if (this.wakeLock) {
        await this.wakeLock.release();
        this.wakeLock = null;
        logInfo("Wake Lock released");
      }
    }
  };
  window.notificationManager = {
    requestPermission: async function() {
      logInfo("=== REQUEST PERMISSION ===");
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await LocalNotifications.requestPermissions();
          logInfo("Permission result:", result);
          
          // Check exact alarm permission (Android 12+)
          try {
            const exactAlarm = await LocalNotifications.checkExactNotificationSetting();
            logInfo("Exact alarm setting:", exactAlarm);
            
            if (exactAlarm.exact_alarm === "denied") {
              logWarn("⚠️ Exact alarm permission denied - prompting user");
              // Prompt user to grant permission
              await this.requestExactAlarmPermission();
            }
          } catch (e) {
            logWarn("Exact alarm check error:", e.message);
          }
          
          return result.display === "granted";
        } catch (err) {
          logError("Permission request failed:", err.message);
          return false;
        }
      }
      return false;
    },
    requestExactAlarmPermission: async function() {
      logInfo("=== REQUEST EXACT ALARM PERMISSION ===");
      
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      try {
        // Check if already granted
        const check = await LocalNotifications.checkExactNotificationSetting();
        if (check.exact_alarm === "granted") {
          logInfo("✓ Exact alarm permission already granted");
          return true;
        }

        // Show explanation dialog to user
        const userConfirmed = confirm(
          "This app needs permission to schedule exact alarms for workout timers.\n\n" +
          "You'll be taken to Settings to enable 'Alarms & reminders' for this app."
        );

        if (!userConfirmed) {
          logWarn("User declined to grant exact alarm permission");
          return false;
        }

        // Open system settings for the app
        // Try using App plugin if available, otherwise show manual instructions
        try {
          if (Capacitor.Plugins && Capacitor.Plugins.App) {
            await Capacitor.Plugins.App.openSettings();
            logInfo("Opened app settings for user to grant permission");
          } else {
            throw new Error("App plugin not available");
          }
        } catch (e) {
          logWarn("Could not open settings automatically:", e.message);
          alert(
            "Please enable 'Alarms & reminders' permission manually:\n\n" +
            "Settings > Apps > Workout Tracker > Alarms & reminders"
          );
        }

        return false; // User needs to manually grant in settings
      } catch (err) {
        logError("requestExactAlarmPermission failed:", err.message);
        return false;
      }
    },
    schedule: async function(seconds, title, body = "") {
      logInfo("============================================================");
      logInfo("=== SCHEDULE NOTIFICATION ===");
      logInfo("============================================================");
      logInfo("seconds:", seconds);
      logInfo("title:", title);
      logInfo("body:", body);
      logInfo("Platform:", Capacitor.getPlatform());
      logInfo("isNative:", Capacitor.isNativePlatform());
      await this.cancel();
      if (Capacitor.isNativePlatform()) {
        // Check exact alarm permission before scheduling
        try {
          const exactAlarm = await LocalNotifications.checkExactNotificationSetting();
          logInfo("Checking exact alarm permission before schedule:", exactAlarm);
          
          if (exactAlarm.exact_alarm === "denied") {
            logWarn("⚠️ Cannot schedule - exact alarm permission denied");
            const retry = await this.requestExactAlarmPermission();
            if (!retry) {
              logError("User did not grant exact alarm permission");
              alert(
                "Timer notifications require 'Alarms & reminders' permission.\n\n" +
                "Please enable it in Settings > Apps > Workout Tracker > Alarms & reminders"
              );
              return;
            }
            // After user grants permission, they'll need to retry the action
            logInfo("User needs to retry after granting permission");
            return;
          }
        } catch (e) {
          logWarn("Could not check exact alarm permission:", e.message);
          // Continue anyway - might work on older Android versions
        }
        
        const fireDate = new Date(Date.now() + seconds * 1e3);
        logInfo("Now:", (/* @__PURE__ */ new Date()).toISOString());
        logInfo("Fire at:", fireDate.toISOString());
        const config = {
          notifications: [{
            id: 1001,
            title,
            body,
            schedule: { at: fireDate, allowWhileIdle: true },
            sound: null,
            smallIcon: "ic_stat_icon_config_sample",
            actionTypeId: "",
            extra: null
          }]
        };
        logInfo("Config:", config);
        try {
          logInfo("Calling LocalNotifications.schedule()...");
          const result = await LocalNotifications.schedule(config);
          logInfo("Schedule returned:", result);
          const pending = await LocalNotifications.getPending();
          logInfo("Pending after schedule:", pending);
          if (pending.notifications?.length > 0) {
            logInfo("\u2713 SUCCESS - notification queued");
          } else {
            logError("\u2717 FAIL - notification NOT in queue");
          }
        } catch (err) {
          logError("*** SCHEDULE FAILED ***");
          logError("Error:", err.message);
          logError("Name:", err.name);
          logError("Stack:", err.stack);
        }
      } else {
        logInfo("Web fallback - setTimeout");
        webTimer = setTimeout(() => {
          logInfo("Web timer fired");
          if (Notification.permission === "granted") {
            new Notification(title, { body });
          }
        }, seconds * 1e3);
      }
    },
    cancel: async function() {
      logInfo("=== CANCEL ===");
      if (Capacitor.isNativePlatform()) {
        try {
          const pending = await LocalNotifications.getPending();
          logInfo("Pending before cancel:", pending);
          if (pending.notifications?.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
            logInfo("Cancelled", pending.notifications.length, "notification(s)");
          }
        } catch (err) {
          logError("Cancel failed:", err.message);
        }
      } else if (webTimer) {
        clearTimeout(webTimer);
        webTimer = null;
      }
    }
  };
  document.addEventListener("visibilitychange", async () => {
    logInfo("Visibility:", document.visibilityState);
    if (document.visibilityState === "visible" && !window.wakeLockManager.wakeLock) {
      if (document.querySelector(".zz_btn_toggle_set_complete")) {
        await window.wakeLockManager.request();
      }
    }
  });
  window.showDebugLogs = createLogViewer;
  setTimeout(() => {
    const btn = document.createElement("button");
    btn.textContent = "\u{1F514}";
    btn.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 15px;
    z-index: 99999;
    width: 50px;
    height: 50px;
    background: #c00;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  `;
    btn.onclick = createLogViewer;
    document.body.appendChild(btn);
    logInfo("Debug button added");
  }, 1500);
  logInfo("============================================================");
  logInfo("SERVICE READY - tap red \u{1F514} button to view logs");
  logInfo("============================================================");
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/