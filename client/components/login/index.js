import {connect} from "react-redux";

import {authenticate, verifyMobileNumber} from "../../constants/action-types";
import Component from "./login";

const mapStateToProps = state => {
  const conf = state.organization.configuration;
  return {
    loginForm: conf.components.login_form,
    privacyPolicy: conf.privacy_policy,
    termsAndConditions: conf.terms_and_conditions,
    orgSlug: conf.slug,
    settings: conf.settings,
    language: state.language,    
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authenticate: authenticate(dispatch),
    verifyMobileNumber: verifyMobileNumber(dispatch)
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
