import { login, signup, authorize, logout } from "../actions/auth";
import { URL } from "../../resources";

export const signupThunk = userObj => async dispatch => {
  try {
    let res = await fetch(`${URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        ...userObj
      })
    });

    res = await res.json();

    localStorage.setItem("token", res.token);

    dispatch(signup(res.user));
  } catch (err) {
    //todo configure auth errors with redux...
  }
};

export const loginThunk = userObj => async dispatch => {
  try {
    let res = await fetch(`${URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        ...userObj
      })
    });

    res = await res.json();

    localStorage.setItem("token", res.token);

    dispatch(login(res.user));
  } catch (err) {
    //todo configure auth errors with redux...
  }
};

export const jwtThunk = token => async dispatch => {
  try {
    let res = await fetch(`${URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token
      }
    });
    res = await res.json();

    return dispatch(authorize(res));
  } catch (err) {
    //todo configure auth errors with redux...
  }
};

export const logoutThunk = token => async dispatch => {
  try {
    await fetch(`${URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token
      }
    });
    localStorage.removeItem("token");
    return dispatch(logout());
  } catch (err) {
    //todo configure auth errors with redux...
  }
};

export const googleOAuthThunk = access_token => async dispatch => {
  try {
    let res = await fetch("http://localhost:5000/oauth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ access_token })
    });

    res = res.json();
    console.log("need to add action, here's the res:", res);
  } catch (err) {}
};
