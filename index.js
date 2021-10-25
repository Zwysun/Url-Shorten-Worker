const html404 = `<!DOCTYPE html>
<body>
  <h1>404 Not Found.</h1>
  <p>The url you visit is not found.</p>
</body>`


async function randomString(len) {
　　len = len || 6;
　　let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　let maxPos = $chars.length;
　　let result = '';
　　for (i = 0; i < len; i++) {
　　　　result += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return result;
}
async function checkURL(URL){
    let str=URL;
    let Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    let objExp=new RegExp(Expression);
    if(objExp.test(str)==true){
      if (str[0] == 'h')
        return true;
      else
        return false;
    }else{
        return false;
    }
} 
async function save_url(URL){
    let random_key=await randomString()
    let is_exist=await LINKS.get(random_key)
    console.log(is_exist)
    if (is_exist == null)
        return await LINKS.put(random_key, URL),random_key
    else
        save_url(URL)
}
async function save_custom_url(URL, custom_key){
  let is_exist=await LINKS.get(custom_key)
  console.log(is_exist)
  if (is_exist == null)
      return await LINKS.put(custom_key, URL), true
  else
      return undefined, false
}
async function handleRequest(request) {
  console.log(request)
  if (request.method === "POST") {
    let req=await request.json()
    console.log(req["url"])
    if(!await checkURL(req["url"])){
    return new Response(`{"status":500,"key":": Error: Url illegal."}`, {
      headers: {
      "content-type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods": "POST",
      },
    })}
    var stat, random_key
    if (req.hasOwnProperty("custom") && req["custom"] != "unknown") {
      stat, set_flag = await save_custom_url(req["url"], req["custom"])
      if (!set_flag) {
        return new Response(`{"status":200,"key":": Error:The custom key has already been used."}`, {
          headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin":"*",
          "Access-Control-Allow-Methods": "POST",
          },
        })
      } else {
        random_key = req["custom"]
      }
    }
    else {
      stat,random_key=await save_url(req["url"])
    }
    console.log(stat)
    if (typeof(stat) == "undefined"){
      return new Response(`{"status":200,"key":"/`+random_key+`"}`, {
      headers: {
      "content-type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods": "POST",
      },
    })
    }else{
      return new Response(`{"status":200,"key":": Error:Reach the KV write limitation."}`, {
      headers: {
      "content-type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods": "POST",
      },
    })}
  }else if(request.method === "OPTIONS"){  
      return new Response(``, {
      headers: {
      "content-type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods": "POST",
      },
    })

  }

  const requestURL = new URL(request.url)
  const path = requestURL.pathname.split("/")[1]
  console.log(path)
  if(!path){
    var os = function() {
      var ua = request.headers.get('user-agent'),
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone, 
      isAndroid = /(?:Android)/.test(ua), 
      isFireFox = /(?:Firefox)/.test(ua), 
      isChrome = /(?:Chrome|CriOS)/.test(ua),
      isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isPc = !isPhone && !isAndroid && !isSymbian;
      return {
          isTablet: isTablet,
          isPhone: isPhone,
          isAndroid : isAndroid,
          isPc : isPc
      };
    }();
    var html_url
    if (os.isPc)
    {
        html_url = "https://cdn.jsdelivr.net/gh/Zwysun/Url-Shorten-Worker@gh-pages/theme/urlcool/index.html"
    }
    else
    {
        html_url = "https://cdn.jsdelivr.net/gh/Zwysun/Url-Shorten-Worker@gh-pages/index.html"
    }
    const html= await fetch(html_url)
    
    return new Response(await html.text(), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  })
  }
  const value = await LINKS.get(path)
  console.log(value)
  

  const location = value
  if (location) {
    return Response.redirect(location, 302)
    
  }
  // If request not in kv, return 404
  return new Response(html404, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
    status: 404
  })
}



addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request))
})
