import "./index.css";

import axios from "axios";
import PropTypes from "prop-types";
import qs from "qs";
import React from "react";
import { Link, Route, withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingContext from "../../utils/loading-context";

import {
  createMobilePhoneTokenUrl,
  verifyMobilePhoneTokenUrl,
  validateApiUrl
} from "../../constants";
import getErrorText from "../../utils/get-error-text";
import getText from "../../utils/get-text";
import logError from "../../utils/log-error";
import Contact from "../contact-box";

class SmsVerification extends React.Component {
  _SmsSentKey = 'OwSmsSent'

  constructor(props) {
    super(props);
    this.state = {
      code: "",
      phone_number: "",
      errors: {},
      success: false,
    };
    this.validateToken = this.validateToken.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resendPhoneToken = this.resendPhoneToken.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    const { setLoading } = this.context;
    event.preventDefault();
    const { orgSlug, match, sms_verification, settings, verifyMobileNumber } = this.props;
    const { input_fields } = sms_verification;
    const { code, errors } = this.state;
    this.setState({ errors: { ...errors, code: "" } });
    const url = verifyMobilePhoneTokenUrl(orgSlug);
    // setLoading(true);
    return axios({
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      url,
      data: qs.stringify({
        code: code,
      }),
    })
      .then(response => {
        this.setState({
          errors: {},
          // success: response.data.detail,
        });
        setLoading(false);
        // TODO: i18n
        // toast.success(response.data.detail);
        verifyMobileNumber(false);
      })
      .catch(error => {
        const { data } = error.response;
        const errorText = getErrorText(error);
        logError(error, errorText);
        toast.error(errorText);
        setLoading(false);
        this.setState({
          errors: {
            ...errors,
            ...(data.code ? { code: data.code } : null),
            ...(errorText ? { nonField: errorText } : { nonField: "" }),
          },
        });
      });
  }

  // TODO: make reusable
  async validateToken() {
    const { setLoading } = this.context;
    const {cookies, orgSlug, logout, verifyMobileNumber} = this.props;
    const token = cookies.get(`${orgSlug}_auth_token`);
    const url = validateApiUrl(orgSlug);
    setLoading(true);
    try {
      const response = await axios({
        method: "post",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        url,
        data: qs.stringify({
          token,
        }),
      });
      setLoading(false);
      if (response.data.response_code !== "AUTH_TOKEN_VALIDATION_SUCCESSFUL") {
        logout(cookies, orgSlug);
        toast.error(genericError, {
          onOpen: () => toast.dismiss(mainToastId),
        });
        logError(
          response,
          '"response_code" !== "AUTH_TOKEN_VALIDATION_SUCCESSFUL"',
        );
      } else {
        const {phone_number, is_active} = response.data;
        this.setState({phone_number: phone_number});
        verifyMobileNumber(!is_active);
      }
      return true;
    } catch (error) {
      logout(cookies, orgSlug);
      toast.error(genericError, {
        onOpen: () => toast.dismiss(mainToastId),
      });
      logError(error, genericError);
      return false;
    }
  }

  hasPhoneTokenBeenSent() {
    return sessionStorage.getItem(this._SmsSentKey) !== null
  }

  async createPhoneToken(resend=false) {
    // do not send new SMS token if one has already been sent
    if (!resend && this.hasPhoneTokenBeenSent()) {
      return;
    }
    const { setLoading } = this.context;
    const { orgSlug, sms_verification, language } = this.props;
    const { code, errors } = this.state;
    const { text } = sms_verification;
    const self = this;
    const url = createMobilePhoneTokenUrl(orgSlug);
    setLoading(true);
    return axios({
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      url
    })
      .then(response => {
        // flag SMS as sent to avoid resending it
        sessionStorage.setItem(self._SmsSentKey, true);
        setTimeout(function(){
          setLoading(false);
          toast.info(getText(text.token_sent, language));
        }, 1000);
      })
      .catch(error => {
        const errorText = getErrorText(error);
        logError(error, errorText);
        toast.error(errorText);
        setLoading(false);
        this.setState({
          errors: {
            ...errors,
            ...(errorText ? { nonField: errorText } : { nonField: "" }),
          },
        });
      });
  }

  async resendPhoneToken() {
    await this.createPhoneToken(true);
  }

  async componentDidMount() {
    await this.validateToken();
    await this.createPhoneToken();
  }

  render() {
    const { code, errors, success, phone_number } = this.state;
    const { orgSlug, language, match, sms_verification, settings } = this.props;
    const { input_fields, buttons, text } = sms_verification;
    console.log(getText(text.verify, language).replace("{phone_number}", phone_number));
    return (
        <>
          <div className="owisp-sms-verification-container">
            <div className="owisp-sms-verification-container-inner">
              <div className="owisp-main-content">
                <form
                  className={`owisp-sms-verification-form ${success ? "success" : ""}`}
                  onSubmit={this.handleSubmit}
                >

                  {text && text.verify && (
                    <div className="owisp-sms-verification-verify-text">
                      {getText(text.verify, language).replace("{phone_number}", phone_number)}
                    </div>
                  )}

                  <div className="owisp-sms-verification-fieldset">
                    {errors.nonField && (
                      <div className="owisp-sms-verification-error owisp-sms-verification-error-non-field">
                        <span className="owisp-sms-verification-error-icon">!</span>
                        <span className="owisp-sms-verification-error-text owisp-sms-verification-error-text-non-field">
                          {errors.nonField}
                        </span>
                      </div>
                    )}

                    {input_fields.code ? (
                      <>
                        <div className="owisp-sms-verification-label-text owisp-sms-verification-label-text-code">
                          {errors.code && (
                            <div className="owisp-sms-verification-error owisp-sms-verification-error-code">
                              <span className="owisp-sms-verification-error-icon">!</span>
                              <span className="owisp-sms-verification-error-text owisp-sms-verification-error-text-code">
                                {errors.code}
                              </span>
                            </div>
                          )}
                          <input
                            className={`owisp-sms-verification-input owisp-sms-verification-input-code ${
                              errors.email ? "error" : ""
                              }`}
                            type={input_fields.code.type}
                            id="owisp-sms-verification-code"
                            required
                            name="code"
                            value={code}
                            onChange={this.handleChange}
                            placeholder={getText(
                              input_fields.code.placeholder,
                              language,
                            )}
                            pattern={
                              input_fields.code.pattern
                                ? input_fields.code.pattern
                                : undefined
                            }
                            title={
                              input_fields.code.pattern_description
                                ? getText(
                                  input_fields.code.pattern_description,
                                  language,
                                )
                                : undefined
                            }
                          />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {buttons.verify ? (
                    <>
                      <input
                        type="submit"
                        className="owisp-sms-verification-form-btn owisp-sms-verification-submit-btn owisp-btn-primary "
                        id="owisp-sms-verification-submit-btn"
                        value={getText(buttons.verify.text, language)}
                      />
                    </>
                  ) : null}
                </form>

                <div className="fieldset">
                  {text && text.resend && (
                    <>
                    <br/>
                    <div className="owisp-sms-verification-resend-text">
                      {getText(text.resend, language)}
                    </div>
                    </>
                  )}
                  {buttons.resend ? (
                    <a className="owisp-btn-primary full-line"
                       id="owisp-sms-verification-resend-btn"
                       onClick={this.resendPhoneToken}>
                      {getText(buttons.resend.text, language)}
                    </a>
                  ) : null}
                </div>

                <div className="fieldset">
                  {text && text.change && (
                    <>
                    <br/>
                    <div className="owisp-sms-verification-change-text">
                      {getText(text.change, language)}
                    </div>
                    </>
                  )}
                  {buttons.resend ? (
                    <a href={`/${orgSlug}/change-phone-number`}
                       className="owisp-btn-primary full-line"
                       id="owisp-sms-verification-change-btn">
                      {getText(buttons.change.text, language)}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="owisp-sms-verification-contact-container">
                <Contact />
              </div>
            </div>
          </div>
          <Route
            path={`${match.path}/:name`}
            render={props => {
              return <Modal {...props} prevPath={match.url} />;
            }}
          />
        </>
    );
  }
}
export default withRouter(SmsVerification);
SmsVerification.contextType = LoadingContext;
SmsVerification.propTypes = {
  settings: PropTypes.shape({
    sms_verification: PropTypes.bool
  }).isRequired,
  language: PropTypes.string.isRequired,
  orgSlug: PropTypes.string.isRequired,
  match: PropTypes.shape({
    path: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
};
