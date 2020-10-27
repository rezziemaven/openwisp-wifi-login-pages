import {connect} from "react-redux";

import Component from "./phone-number-change";
import {logout, verifyMobileNumber} from "../../constants/action-types";

const mapStateToProps = state => {
  const conf = state.organization.configuration;
  return {
    needsSmsVerification: conf.needsSmsVerification,
    phone_number_change: conf.components.phone_number_change_form,
    sms_verification: conf.components.sms_verification_form,
    registration: conf.components.registration_form,
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
