import * as maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';

const ta_legend = document.getElementById('ta-legend')
ta_legend.innerHTML = '<p><span class="circle01"></span>：神道系（神社など）</p><p><span class="circle02"></span>：仏教系（お寺など）</p><hr><h3>この地図について</h3><p class="remark">この地図は、日本の神道系・仏教系の施設の集積密度に基づく色分け図です。<br>神社など神道系の施設が密集するほど濃い緑色に、お寺など仏教系の施設が密集するほど濃い茶色に、いずれか強い方の色で染まります。<br>地図をクリックすると表示される情報のうち、「パワー密度」は当該箇所の神道系＋仏教系の密度値を示し、「比率」は当該箇所内における神道系・仏教系それぞれの密度値の割合を示します。<br>また、地図を拡大すると密度計算の際に参照した施設の位置がそれぞれの色で地図上に表示されます。</p><h3>作成工程について</h3><p class="remark">この地図は、<a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>のreligion="shinto"または"buddhist"に該当するnodeを<a href="https://overpass-turbo.eu/" target="_blank">Overpass</a>経由で取得(2023年1月時点)し、それぞれの点密度を日本各地（等間隔にグリッド分割した各箇所）ごとに距離値の逆数から計算し、その結果に基づき色分けしたものです。<br>ご質問等は作成者まで(<a href="https://twitter.com/Smille_feuille"> Twitter</a> | <a href="https://github.com/sanskruthiya/ochizu-sama">Github</a> )。</p>'

const init_coord = [140.2280, 39.0473];
const init_zoom = 5;
const init_bearing = 0;
const init_pitch = 0;

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile2.openstreetmap.jp/styles/osm-bright-ja/style.json',
    center: init_coord,
    interactive: true,
    zoom: init_zoom,
    minZoom: 5,
    maxZoom: 20,
    maxPitch: 60,
    maxBounds: [[110.0000, 20.0000],[170.0000, 50.0000]],
    bearing: init_bearing,
    pitch: init_pitch,
    attributionControl:true
});

map.on('load', function () {
    map.addSource('kami', {
        'type': 'vector',
        'tiles': [location.href+"/app/tile/{z}/{x}/{y}.pbf"],
        "minzoom": 5,
        "maxzoom": 12,
    });
    map.addLayer({
        'id': 'sb_poi',
        'type': 'circle',
        'source':'kami',
        'source-layer': 'religion_poi',
        'filter': ['!=', 'religion', 'christian'], //元々キリスト教のノードも対象にしていたが簡潔さのためここでは除外する。
        'minzoom': 9,
        'layout': {
            'visibility': 'visible',
        },
       'paint': {'circle-radius':10, 'circle-color': 'transparent'}
    });
    map.addLayer({
        'id': 's_heatmap',
        'type': 'heatmap',
        'source': 'kami',
        'source-layer': 'religion_poi',
        'filter': ['==', 'religion', 'shinto'],
        'minzoom': 9,
        'paint': {
            'heatmap-intensity': ['interpolate',['linear'],['zoom'],0,1,20,10],
            'heatmap-color': ['interpolate',['linear'],['heatmap-density'],0,'rgba(200,255,255,0)', 0.4, '#e6f6e1', 1, '#7bc87c'],
            'heatmap-radius': ['interpolate',['linear'],['zoom'],0,1,12,12,20,100],
            'heatmap-opacity': ['interpolate',['linear'],['zoom'],15,1,20,0]
        },  
        'layout': {
            'visibility': 'visible',
        }
    });
    map.addLayer({
        'id': 'b_heatmap',
        'type': 'heatmap',
        'source': 'kami',
        'source-layer': 'religion_poi',
        'filter': ['==', 'religion', 'buddhist'],
        'minzoom': 9,
        'paint': {
            'heatmap-intensity': ['interpolate',['linear'],['zoom'],0,1,20,10],
            'heatmap-color': ['interpolate',['linear'],['heatmap-density'],0,'rgba(200,255,255,0)', 0.4, '#ffe7cf', 1, '#fd9243'],
            'heatmap-radius': ['interpolate',['linear'],['zoom'],0,1,12,12,20,100],
            'heatmap-opacity': ['interpolate',['linear'],['zoom'],15,1,20,0]
        },  
        'layout': {
            'visibility': 'visible',
        }
    });
    map.addLayer({
        'id': 'hexgrid',
        'type': 'fill',
        'source': 'kami',
        'source-layer': 'religion_hexGrid',
        'filter': ['!=', 'Top1', 'キリスト教'], //元々キリスト教も評価対象にしていたが簡潔さのためここでは除外する。
        'layout': {
            'visibility': 'visible',
        },
        'paint': {'fill-color': 'transparent'}
    });
    map.addLayer({
        'id': 'shinto',
        'type': 'fill',
        'source': 'kami',
        'source-layer': 'religion_hexGrid',
        'filter': ['==', 'Top1', '神道'],
        'maxzoom': 15,
        'layout': {
            'visibility': 'visible',
        },
        'paint': {
            'fill-color': [
                'let',
                'density',
                ['get', '神道'],
                [
                    'interpolate',
                    ['linear'],
                    ['var', 'density'],
                    0,
                    ['to-color', '#f7fcf5'], 
                    998,
                    ['to-color', '#e6f6e1'],
                    2592,
                    ['to-color', '#caeac3'],
                    5016,
                    ['to-color', '#a6db9f'],
                    8172,
                    ['to-color', '#7bc87c'],
                    12502,
                    ['to-color', '#4bb062'],
                    18433,
                    ['to-color', '#2a924a'],
                    25391,
                    ['to-color', '#077331'],
                    59300,
                    ['to-color', '#00441b']
                ]
            ],
        'fill-opacity': ['interpolate',['linear'],['zoom'],5,0.4,8,0.6,10,0.1],
        }
    });
    map.addLayer({
        'id': 'buddhist',
        'type': 'fill',
        'source': 'kami',
        'source-layer': 'religion_hexGrid',
        'filter': ['==', 'Top1', '仏教'],
        'maxzoom': 15,
        'layout': {
            'visibility': 'visible',
        },
        'paint': {
            'fill-color': [
                'let',
                'density',
                ['get', '仏教'],
                [
                    'interpolate',
                    ['linear'],
                    ['var', 'density'],
                    0,
                    ['to-color', '#fff5eb'], 
                    998,
                    ['to-color', '#ffe7cf'],
                    2592,
                    ['to-color', '#fed2a6'],
                    5016,
                    ['to-color', '#fdb271'],
                    8172,
                    ['to-color', '#fd9243'],
                    12502,
                    ['to-color', '#f4701a'],
                    18433,
                    ['to-color', '#df4f05'],
                    25391,
                    ['to-color', '#b13902'],
                    59300,
                    ['to-color', '#7f2704']
                ]
            ],
        'fill-opacity': ['interpolate',['linear'],['zoom'],5,0.4,8,0.6,10,0.1],
        }
    });
});

map.on('click', 'hexgrid', function (e) {
    let query_point = map.queryRenderedFeatures(e.point, { layers: ['sb_poi']})[0] !== undefined ? map.queryRenderedFeatures(e.point, { layers: ['sb_poi']})[0].properties : "no-layer";
    const a_top = e.features[0].properties["Top1"];
    const a_sum = Number(e.features[0].properties["神道"]+e.features[0].properties["仏教"]);
    const a_r01 = Math.round(Number(e.features[0].properties[a_top] / a_sum) * 100);
    const a_r02 = 100 - a_r01;
    let popupContent = '<p class="tipstyle02">この周辺はパワー密度 '+ Math.round(a_sum).toLocaleString() +'<br>比率 '+a_r01+' : '+a_r02+' で '+a_top+' が強い地域です。</p>';
    if (query_point !==  "no-layer") {
        if (query_point['name'] && query_point['name'].length > 2){
            popupContent += '<p class="tipstyle02">'+query_point['name']+'が近くにあります。</p>';
        } else {
            popupContent += '<p class="tipstyle02">ここの施設名称は不明です。</p>';
        }
    }
    new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"280px"})
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
});
map.on('mouseenter', 'hexgrid', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'hexgrid', function () {
    map.getCanvas().style.cursor = '';
});

document.getElementById('b_legend').style.backgroundColor = "#fff";
document.getElementById('b_legend').style.color = "#333";

document.getElementById('b_location').style.backgroundColor = "#fff";
document.getElementById('b_location').style.color = "#333";

document.getElementById('legend').style.display ="none";

document.getElementById('b_legend').addEventListener('click', function () {
    const visibility = document.getElementById('legend');
    if (visibility.style.display == 'block') {
        visibility.style.display = 'none';
        this.style.backgroundColor = "#fff";
        this.style.color = "#555"
    }
    else {
        visibility.style.display = 'block';
        this.style.backgroundColor = "#2c7fb8";
        this.style.color = "#fff";
    }
});

const loc_options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
};

document.getElementById('icon-loader').style.display = 'none';

let popup_loc = new maplibregl.Popup({anchor:"bottom", focusAfterOpen:false});
let marker_loc = new maplibregl.Marker();
let flag_loc = 0;

document.getElementById('b_location').addEventListener('click', function () {
    this.setAttribute("disabled", true);
    if (flag_loc > 0) {
        marker_loc.remove();
        popup_loc.remove();
        this.style.backgroundColor = "#fff";
        this.style.color = "#333";
        flag_loc = 0;
        this.removeAttribute("disabled");
    }
    else {
        document.getElementById('icon-loader').style.display = 'block';
        this.style.backgroundColor = "#87cefa";
        this.style.color = "#fff";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                marker_loc.remove();
                popup_loc.remove();
                document.getElementById('icon-loader').style.display = 'none';
                this.style.backgroundColor = "#2c7fb8";
                this.style.color = "#fff";

                let c_lat = position.coords.latitude;
                let c_lng = position.coords.longitude;
            
                map.jumpTo({
                    center: [c_lng, c_lat],
                    zoom: init_zoom + 1,
                });
                
                popup_loc.setLngLat([c_lng, c_lat]).setHTML('<p class="tipstyle02">現在地</p>').addTo(map);
                marker_loc.setLngLat([c_lng, c_lat]).addTo(map);
                flag_loc = 1;
                this.removeAttribute("disabled");
            },
            (error) => {
                popup_loc.remove();
                document.getElementById('icon-loader').style.display = 'none';
                this.style.backgroundColor = "#999";
                this.style.color = "#fff";
                console.warn(`ERROR(${error.code}): ${error.message}`)
                map.flyTo({
                    center: init_coord,
                    zoom: init_zoom,
                    speed: 1,
                });
                popup_loc.setLngLat(init_coord).setHTML('現在地が取得できませんでした').addTo(map);
                flag_loc = 2;
                this.removeAttribute("disabled");
            },
            loc_options
        );
    }
});
