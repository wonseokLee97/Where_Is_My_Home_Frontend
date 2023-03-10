import jwtDecode from "jwt-decode";
import router from "@/router";
import {
  login,
  idCheck,
  findById,
  tokenRegeneration,
  logout,
  regist,
  modify,
  deleteUser,
  findByName,
} from "@/api/member";

const memberStore = {
  namespaced: true,
  state: {
    isValidId: false,
    isValidate: false,
    isLogin: false,
    isLoginError: false,
    userInfo: null,
    isValidToken: false,
  },
  getters: {
    checkUserInfo: function (state) {
      return state.userInfo;
    },
    checkToken: function (state) {
      return state.isValidToken;
    },
  },
  mutations: {
    SET_IS_VALID_ID: (state, isValidId) => {
      state.isValidId = isValidId;
    },
    SET_IS_LOGIN: (state, isLogin) => {
      state.isLogin = isLogin;
    },
    SET_IS_LOGIN_ERROR: (state, isLoginError) => {
      state.isLoginError = isLoginError;
    },
    SET_IS_VALID_TOKEN: (state, isValidToken) => {
      state.isValidToken = isValidToken;
    },
    SET_USER_INFO: (state, userInfo) => {
      state.isLogin = true;
      state.userInfo = userInfo;
    },
    SET_USER_VALIDATE: (state, isValidate) => {
      state.isValidate = isValidate;
    },
  },

  actions: {
    async idCheck({ commit }, userId) {
      await idCheck(
        userId,
        ({ data }) => {
          commit("SET_IS_VALID_ID", data == 0);
        },
        (error) => {
          console.log(error);
        }
      );
    },
    async userConfirm({ commit }, user) {
      await login(
        user,
        ({ data }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            let refreshToken = data["refresh-token"];
            commit("SET_IS_LOGIN", true);
            commit("SET_IS_LOGIN_ERROR", false);
            commit("SET_IS_VALID_TOKEN", true);
            sessionStorage.setItem("access-token", accessToken);
            sessionStorage.setItem("refresh-token", refreshToken);
          } else {
            commit("SET_IS_LOGIN", false);
            commit("SET_IS_LOGIN_ERROR", true);
            commit("SET_IS_VALID_TOKEN", false);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },
    async getUserInfo({ commit, dispatch }, token) {
      let decodeToken = jwtDecode(token);
      await findById(
        decodeToken.userid,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_USER_INFO", data.userInfo);
          } else {
            console.log("?????? ?????? ??????");
          }
        },
        async (error) => {
          console.log("getUserInfo() error code [?????? ??????] ::: ", error.response.status);
          commit("SET_IS_VALID_TOKEN", false);
          await dispatch("tokenRegeneration");
        }
      );
    },
    async tokenRegeneration({ commit, state }) {
      await tokenRegeneration(
        JSON.stringify(state.userInfo),
        ({ data }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            sessionStorage.setItem("access-token", accessToken);
            commit("SET_IS_VALID_TOKEN", true);
          }
        },
        async (error) => {
          // HttpStatus.UNAUTHORIZE(401) : RefreshToken ?????? ?????? >> ?????? ?????????
          if (error.response.status === 401) {
            console.log("?????? ??????");
            // ?????? ????????? ??? DB??? ????????? RefreshToken ??????
            await logout(
              state.userInfo.userid,
              ({ data }) => {
                if (data.message === "success") {
                  console.log("???????????? ?????? ?????? ??????");
                } else {
                  console.log("???????????? ?????? ?????? ??????");
                }
                alert("????????? ??????! ?????? ???????????? ?????????.");
                commit("SET_IS_LOGIN", false);
                commit("SET_USER_INFO", null);
                commit("SET_IS_VALID_TOKEN", false);
                router.push({ name: "login" });
              },
              (error) => {
                console.log(error);
                commit("SET_IS_LOGIN", false);
                commit("SET_USER_INFO", null);
              }
            );
          }
        }
      );
    },
    async userLogout({ commit }, userid) {
      await logout(
        userid,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_LOGIN", false);
            commit("SET_USER_INFO", null);
            commit("SET_IS_VALID_TOKEN", false);
          } else {
            console.log("?????? ?????? ??????");
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },
    async registUser(_, user) {
      await regist(
        user,
        ({ data }) => {
          if (data === "success") {
            alert("???????????? ??????");
            router.push({ name: "login" });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },

    async modifyUser({ commit }, user) {
      await modify(
        user,
        ({ data }) => {
          if (data === "success") {
            alert("???????????? ?????? ??????");
            commit("SET_USER_INFO", user);
            router.push({ name: "home" });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },

    async deleteUser({ commit }, userid) {
      await deleteUser(
        userid,
        ({ data }) => {
          if (data === "success") {
            alert("???????????? ??????");
            commit("SET_USER_INFO", null);
            router.push({ name: "home" });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },

    async checkEmail({ commit }, user) {
      await findByName(
        user,
        ({ data }) => {
          console.log(data);
          let msg = "????????? ?????? ????????? ?????? ??? ????????????.";
          if (data.message === "success") {
            msg = "?????? ???????????? ??????????????? ??????????????????.";
            commit("SET_USER_VALIDATE", user.userName);
          }
          commit("SET_USER_VALIDATE", null);
          alert(msg);
        },
        (error) => {
          console.log(error);
        }
      );
    },

    // async sendEmail(_, userEmail) {
    //   await sendEmail(
    //     userEmail,
    //     ({ data }) => {
    //       console.log(data);
    //       console.log("????????? ??????");
    //     },
    //     (error) => {
    //       console.log(error);
    //     }
    //   )
    // }
  },
};

export default memberStore;
//
