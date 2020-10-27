export const PARSE_ORGANIZATIONS = "PARSE_ORGANIZATIONS";
export const SET_AUTHENTICATION_STATUS = "SET_AUTHENTICATION_STATUS";
export const SET_LANGUAGE = "SET_LANGUAGE";
export const SET_ORGANIZATION_CONFIG = "SET_ORGANIZATION_CONFIG";
export const SET_ORGANIZATION_STATUS = "SET_ORGANIZATION_STATUS";
export const SET_MOBILE_PHONE_VERIFICATION_STATUS = "SET_MOBILE_PHONE_VERIFICATION_STATUS";

import logoutAction from "../actions/logout";

export const authenticate = dispatch => {
    return status => {
      dispatch({type: SET_AUTHENTICATION_STATUS, payload: status});
    }
}
export const verifyMobileNumber = dispatch => {
    return status => {
      dispatch({type: SET_MOBILE_PHONE_VERIFICATION_STATUS, payload: status});
    }
}
export const logout = dispatch => {
    return (cookies, slug) => {
      dispatch(logoutAction(cookies, slug));
    }
}
