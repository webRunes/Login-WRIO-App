!function e(t, r, s) {
    function o(n, a) {
        if (!r[n]) {
            if (!t[n]) {
                var l = "function" == typeof require && require;
                if (!a && l)return l(n, !0);
                if (i)return i(n, !0);
                var d = new Error("Cannot find module '" + n + "'");
                throw d.code = "MODULE_NOT_FOUND", d
            }
            var c = r[n] = {exports: {}};
            t[n][0].call(c.exports, function (e) {
                var r = t[n][1][e];
                return o(r ? r : e)
            }, c, c.exports, e, t, r, s)
        }
        return r[n].exports
    }

    for (var i = "function" == typeof require && require, n = 0; n < s.length; n++)o(s[n]);
    return o
}({
    1: [function (e, t, r) {
        "use strict";
        var s = "https://wrioos.com/", o = "https://webrunes.github.io/", i = "Default-WRIO-Theme", n = s + i + "/widget/";
        t.exports = {importUrl: s, cssUrl: o, theme: i, themeImportUrl: n, isAirticlelist: !1}
    }, {}], 2: [function (e, t, r) {
        "use strict";
        var s, o, i = '<div id="preloader" class="preloader-wrapper loading" style="height: 100%; display: block; margin: 0;"><div class="preloader" style="position: fixed; top: 0; z-index: 9999; min-height: 600px; width: 100%; height: 100%; display: table; vertical-align: middle;"><div class="container" style="position: relative; vertical-align: middle; display: table-cell; height: 260px; text-align: center;"><h1 style="font-family: BebasNeue,sans-serif; color: #eee; font-size: 32px; text-transform: uppercase; text-shadow: 2px 2px 4px #000; -webkit-font-smoothing: antialiased;">webRunes webgate</h1><p style="font-family: sans-serif;  color: #eee; font-size: 11px; font-weight: bold; text-transform: uppercase;">Alpha stage, certain issues and slow connection may be expected</p><div class="inner" style="margin: 128px auto 0; width: 140px; height: 260px;"><div class="preloader-logo"></div><div class="progress progress-striped active" style="height: 6px; margin: 20px 0;"><div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="background-color: #0088cc !important; width: 100% !important;"></div></div><p style="font-family: sans-serif;  color: #eee; font-size: 11px; font-weight: bold; text-transform: uppercase;">Loading... please wait</p></div></div></div></div>', n = document.getElementsByTagName("head")[0], a = [], l = e("./js/global").cssUrl, d = e("./js/global").theme, c = ["https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css", l + d + "/css/webrunes.css"], h = c.length, p = {
            init: function () {
                if ((null == a || a.length < 1) && (a = this.defaultNotSupportedBrowsers), this.detectBrowser(), this.detectOS(), "" != this.browser && "Unknown" != this.browser && "" != this.os && "Unknown" != this.os && "" != this.browserVersion && 0 != this.browserVersion) {
                    for (var e = !1, t = 0; t < a.length; t++)if (("Any" == a[t].os || a[t].os == this.os) && ("Any" == a[t].browser || a[t].browser == this.browser) && ("Any" == a[t].version || this.browserVersion <= parseFloat(a[t].version))) {
                        e = !0;
                        break
                    }
                    return e ? void this.writeNoticeCode() : !1
                }
            },
            writeNoticeCode: function () {
                window.location.href = "//wrioos.com/old_browser.htm"
            },
            detectBrowser: function () {
                this.browser = "", this.browserVersion = 0, /Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Opera" : /MSIE (\d+\.\d+);/.test(navigator.userAgent) ? this.browser = "MSIE" : /Navigator[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Netscape" : /Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Chrome" : /Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? (this.browser = "Safari", /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent), this.browserVersion = new Number(RegExp.$1)) : /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && (this.browser = "Firefox"), "" == this.browser ? this.browser = "Unknown" : 0 == this.browserVersion && (this.browserVersion = parseFloat(new Number(RegExp.$1)))
            },
            detectOS: function () {
                for (var e = 0; e < this.operatingSystems.length; e++)if (-1 != this.operatingSystems[e].searchString.indexOf(this.operatingSystems[e].subStr))return void(this.os = this.operatingSystems[e].name);
                this.os = "Unknown"
            },
            noticeHeight: 0,
            browser: "",
            os: "",
            browserVersion: "",
            operatingSystems: [{
                searchString: navigator.platform,
                name: "Windows",
                subStr: "Win"
            }, {searchString: navigator.platform, name: "Mac", subStr: "Mac"}, {
                searchString: navigator.platform,
                name: "Linux",
                subStr: "Linux"
            }, {searchString: navigator.userAgent, name: "iPhone", subStr: "iPhone/iPod"}],
            defaultNotSupportedBrowsers: [{os: "Any", browser: "MSIE", version: 6}, {
                os: "Any",
                browser: "MSIE",
                version: 7
            }, {os: "Any", browser: "MSIE", version: 8}, {os: "Any", browser: "MSIE", version: 9}]
        };
        if (o = document.createElement("link"), o.rel = "stylesheet", o.href = l + d + "/css/loading.css", n.appendChild(o), window.document.body.style.heigth = "100%", window.document.body.style.margin = 0, document.documentElement.style.heigth = "100%", document.documentElement.style.margin = 0, localStorage && !localStorage.getItem("oldUser") && (localStorage.setItem("oldUser", !0), window.document.body.innerHTML += i), p.init())document.getElementById("preloader").style.display = "none"; else {
            for (var g = 0; h > g; g++) {
                var u;
                u = document.createElement("link"), u.rel = "stylesheet", u.href = c[g], n.appendChild(u)
            }
            var m = setInterval(function () {
                if (document.styleSheets.length > c.length) {
                    var e = document.createElement("script");
                    e.setAttribute("type", "text/javascript");
                    var t = !1;
                    window.localStorage && localStorage.getItem("debugJS") && (t = !0), t ? e.setAttribute("src", "//wrioos.com/raw/main.js") :
                        e.setAttribute("src", "https://login.wrioos.com/host/main.js"), document.body.appendChild(e), clearInterval(m)
                }
            }, 10);
            s = document.createElement("link"), s.rel = "shortcut icon", s.href = l + d + "/ico/favicon.ico", n.appendChild(s)
        }
    }, {"./js/global": 1}]
}, {}, [2]);
/* Tue Mar 01 2016 12:32:44 GMT+0000 (UTC) WRIO-InternetOS build 1.0.154 */

//# sourceMappingURL=start.js.map
