<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "KakaoMap",
  data() {
    return {
      map: null,
      markers: [],
      /* global kakao */
      positions: [],
    };
  },

  watch: {
    apartList() {
      this.displayMarkers(this.apartList);
    },
  },

  computed: {
    ...mapState("apartStore", ["apartList"]),
  },

  methods: {
    initMap() {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(35.2057155248371, 126.81148246309938),
        level: 14,
      };
      this.map = new kakao.maps.Map(container, options);
    },

    displayMarkers(apartList) {
      const positions = [];
      const forCluster = [];
      apartList.forEach((apt) => {
        const parse_pos = {
          title: apt.apartmentName,
          latlng: new kakao.maps.LatLng(apt.lat, apt.lng),
        };

        const fc = {
          lat: apt.lat,
          lng: apt.lng,
        };
        positions.push(parse_pos);
        forCluster.push(fc);
      });

      // 1. 지도위의 마커 초기화
      if (this.markers.length > 0) {
        this.markers.forEach((item) => {
          item.setMap(null);
        });
      }

      // 2. 마커 이미지 커스터마이징
      const imgSrc = require("@/assets/markerStar.png");
      const imgSize = new kakao.maps.Size(28, 25);
      const markerImage = new kakao.maps.MarkerImage(imgSrc, imgSize);

      // 3. 마커 표시하기
      positions.forEach((position) => {
        // console.log(position);

        const infowindow = new kakao.maps.InfoWindow({
          removable: true,
          content: `
            <div style="padding:5px;">
              위치: 서울특별시<br>
              아파트명: ${position.title}
            </div>
            `,
        });

        const marker = new kakao.maps.Marker({
          map: this.map,
          position: position.latlng,
          title: position.title,
          image: markerImage,
        });

        kakao.maps.event.addListener(marker, "mouseover", () => {
          infowindow.open(this.map, marker);
        });

        kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close(this.map, marker);
        });

        this.markers.push(marker);
      });

      // 4. 지도 이동
      const bounds = positions.reduce(
        (bounds, position) => bounds.extend(position.latlng),
        new kakao.maps.LatLngBounds(),
      );

      this.map.setBounds(bounds);

      const clusterer = new kakao.maps.MarkerClusterer({
        map: this.map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 5, // 클러스터 할 최소 지도 레벨
      });

      console.log(forCluster);
      var data = {
        positions: forCluster,
      };

      console.log(positions);
      console.log(data.positions);
      const markers = data.positions.map(function (position) {
        return new kakao.maps.Marker({
          position: new kakao.maps.LatLng(position.lat, position.lng),
        });
      });

      console.log(markers);
      console.log(clusterer);
      // 클러스터러에 마커들을 추가합니다
      clusterer.addMarkers(markers);

      console.log(clusterer);
      kakao.maps.event.addListener(clusterer, "clusterclick", function () {
        this.zoom(clusterer);
      });
    },

    zoom(cluster) {
      // 현재 지도 레벨에서 1레벨 확대한 레벨
      var level = this.map.getLevel() - 1;

      // 지도를 클릭된 클러스터의 마커의 위치를 기준으로 확대합니다
      this.map.setLevel(level, { anchor: cluster.getCenter() });
    },
  },

  mounted() {
    if (!window.kakao || !window.kakao.maps) {
      // script 태그 객체 생성
      const script = document.createElement("script");
      script.src = process.env.VUE_APP_KAKAO_URL;
      script.addEventListener("load", () => {
        kakao.maps.load(this.initMap);
        // console.log("loaded", window.kakao);
      });
      document.head.appendChild(script);
    } else {
      // console.log("이미 로딩됨: ", window.kakao);
      this.initMap();
    }
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
</style>