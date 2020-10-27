import {connect} from "react-redux";

import Component from "./sms-verification";
import {logout, verifyMobileNumber} from "../../constants/action-types";

const mapStateToProps = (state) => {
  const conf = state.organization.configuration;
  return {
    sms_verification: conf.components.sms_verification_form,
    settings: conf.settings,
    orgSlug: conf.slug,
    language: state.language,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    logout: logout(dispatch),
    verifyMobileNumber: verifyMobileNumber(dispatch)
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
