import React from "react";
import { connect } from "react-redux";
import GoogleLogin from "react-google-login";
import { googleOAuthThunk } from "../../redux/thunks/auth";

//todo take care of the clientId value -- why isn't process.env working?

const GoogleOAuth = props => {
  const googleResponse = response => {
    let user = response.profileObj;

    // console.log("access_token:", response.Zi.access_token);
    props.googleOAuthThunk(user);
  };

  // console.log("oauth:", process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID);

  return (
    <GoogleLogin
      render={renderProps => (
        <button
          className="login-page-button google-button"
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          {props.type + " with Google"}
        </button>
      )}
      onSuccess={googleResponse}
      onFailure={err => {
        console.log({ err });
      }}
      clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
    />
  );
};

const mapDispatchToProps = dispatch => {
  return {
    googleOAuthThunk: access_token => dispatch(googleOAuthThunk(access_token))
  };
};

export default connect(
  null,
  mapDispatchToProps
)(GoogleOAuth);

//"602278501830-rphr8gpcgsbitjkn43gcej296j9723sh.apps.googleusercontent.com"
