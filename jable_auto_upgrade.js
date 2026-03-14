// Jable Widget Plugin (Upgraded Example)
// Features:
// 1. Auto load all models
// 2. Search
// 3. Hot / New
// 4. Actress list auto generated

const BASE = "https://jable.tv";

async function http(url){
  const r = await Widget.http.get(url,{
    headers:{
      "User-Agent":"Mozilla/5.0",
      "Accept":"text/html"
    }
  });
  return r.data;
}

function parseVideos(html){
  const $ = Widget.html.load(html);
  const list = [];

  $(".video-img-box").each((i,el)=>{

    const a = $(el).find("a").attr("href");
    const title = $(el).find(".title").text().trim();
    const img = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
    const preview = $(el).attr("data-preview");
    const duration = $(el).find(".label").text().trim();

    if(a){
      list.push({
        id:a,
        title:title,
        backdropPath:img,
        previewUrl:preview,
        link:a,
        releaseDate:duration
      });
    }

  });

  return list;
}

async function loadPage(url){
  const html = await http(url);
  return parseVideos(html);
}

async function search(params={}){
  const keyword = params.keyword || "";
  const page = params.page || 1;
  const url = `${BASE}/search/${encodeURIComponent(keyword)}/?page=${page}`;
  return await loadPage(url);
}

async function hot(params={}){
  const page = params.page || 1;
  return await loadPage(`${BASE}/hot/?page=${page}`);
}

async function latest(params={}){
  const page = params.page || 1;
  return await loadPage(`${BASE}/new-release/?page=${page}`);
}

async function loadModels(){

  const html = await http(`${BASE}/models/`);
  const $ = Widget.html.load(html);

  const models = [];

  $(".model-box").each((i,el)=>{

    const name = $(el).find(".model-name").text().trim();
    const link = $(el).find("a").attr("href");

    if(name && link){
      models.push({
        title:name,
        functionName:"modelVideos",
        params:{url:link}
      });
    }

  });

  return models;

}

async function modelVideos(params={}){
  const page = params.page || 1;
  const url = params.url + `?page=${page}`;
  return await loadPage(url);
}

WidgetMetadata = {
  id:"jable_auto",
  title:"Jable Auto",
  description:"Auto models + stable parser",
  version:"2.0.0",
  requiredVersion:"0.0.1"
};

Widget = {

  metadata:WidgetMetadata,

  async home(){

    const models = await loadModels();

    return {

      modules:[
        {
          title:"Search",
          functionName:"search"
        },
        {
          title:"Hot",
          functionName:"hot"
        },
        {
          title:"Latest",
          functionName:"latest"
        },
        {
          title:"Models",
          modules:models
        }
      ]

    };

  },

  search,
  hot,
  latest,
  modelVideos

};
