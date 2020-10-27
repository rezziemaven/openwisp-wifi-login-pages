import "./index.css";

import axios from "axios";
import PropTypes from "prop-types";
import qs from "qs";
import React from "react";
import { Link, Route, withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingContext from "../../utils/loading-context";

import { mobilePhoneChangeUrl, validateApiUrl } from "../../constants";
import getErrorText from "../../utils/get-error-text";
import getText from "../../utils/get-text";
import logError from "../../utils/log-error";
import Contact from "../contact-box";
import PhoneInput from 'react-phone-input-2';

class PhoneNumberChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone_number: "",
      errors: {}
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateToken = this.validateToken.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { setLoading } = this.context;
    const { orgSlug, language, sms_verification, settings, verifyMobileNumber } = this.props;
    const { phone_number, errors } = this.state;
    const url = mobilePhoneChangeUrl(orgSlug);
    const self = this;
    this.setState({ errors: { ...errors, phone_number: "" } });
    setLoading(true);
    return axios({
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      url,
      data: qs.stringify({
        phone_number: phone_number,
      }),
    })
      .then(response => {
        this.setState({
          errors: {},
        });
        setTimeout(function(){
          setLoading(false);
          toast.info(getText(sms_verification.text.token_sent, language));
          self.props.history.push(`/${orgSlug}/sms-verification`);
        }, 1000);  // TODO: make 1000 constant
      })
      .catch(error => {
        const { data } = error.response;
        const errorText = getErrorText(error);
        errorText && logError(error, errorText) && toast.error(errorText);
        setLoading(false);
        this.setState({
          errors: {
            ...errors,
            ...(data.phone_number ? { phone_number: data.phone_number } : null),
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
        this.setState({phone_number});
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

  async componentDidMount() {
    await this.validateToken();
  }

  render() {
    const { phone_number, errors, organization } = this.state;
    const { orgSlug, language, phone_number_change, registration, settings, needsSmsVerification } = this.props;
    const { input_fields } = registration;
    const { buttons } = phone_number_change;
    // TODO: may be better to use history.push
    if (needsSmsVerification === false) {
      return <Redirect to={`/${orgSlug}/status`} />;
    }
    return (
        <>
          <div className="owisp-phone-number-change-container">
            <div className="owisp-phone-number-change-container-inner">
              <div className="owisp-main-content">
                <form
                  className="owisp-phone-number-change-form"
                  onSubmit={this.handleSubmit}
                >

                  <div className="owisp-phone-number-change-fieldset">
                    {errors.nonField && (
                      <div className="owisp-phone-number-change-error owisp-phone-number-change-error-non-field">
                        <span className="owisp-phone-number-change-error-icon">!</span>
                        <span className="owisp-phone-number-change-error-text owisp-phone-number-change-error-text-non-field">
                          {errors.nonField}
                        </span>
                      </div>
                    )}

                    {input_fields.phone_number ? (
                      <>
                        <div className="owisp-phone-number-change-label owisp-phone-number-change-label-phone-number">
                          <label
                            className="owisp-phone-number-change-label-text owisp-phone-number-change-label-text-phone-number"
                            htmlFor="owisp-phone-number-change-phone-number"
                          >
                            {getText(input_fields.phone_number.label, language)}
                          </label>
                          {errors.phone_number && (
                            <div className="owisp-phone-number-change-error owisp-phone-number-change-error-code">
                              <span className="owisp-phone-number-change-error-icon">!</span>
                              <span className="owisp-phone-number-change-error-text owisp-phone-number-change-error-text-code">
                                {errors.phone_number}
                              </span>
                            </div>
                          )}
                          <PhoneInput
                            name="phone_number"
                            country={input_fields.phone_number.country}
                            onlyCountries={input_fields.phone_number.only_countries || []}
                            preferredCountries={input_fields.phone_number.preferred_countries || []}
                            excludeCountries={input_fields.phone_number.exclude_countries || []}
                            value={phone_number}
                            onChange={value => this.setState({phone_number: `+${value}`})}
                            placeholder={getText(
                              input_fields.phone_number.placeholder,
                              language,
                            )}
                            enableSearch={Boolean(input_fields.phone_number.enable_search)}
                            inputProps={{
                              name: "phone_number",
                              id: "owisp-phone-number-change-phone-number",
                              className: `form-control owisp-phone-number-change-input owisp-phone-number-change-input-phone-number ${errors.email ? "error" : ""}`,
                              required: true,
                            }}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {buttons.phone_number_change ? (
                    <>
                      <input
                        type="submit"
                        className="owisp-phone-number-change-form-btn owisp-phone-number-change-submit-btn owisp-btn-primary"
                        id="owisp-phone-number-change-submit-btn"
                        value={getText(buttons.phone_number_change.text, language)}
                      />
                    </>
                  ) : null}

                  {buttons.change_phone_number ? (
                    <>
                      <input
                        type="submit"
                        className="owisp-phone-number-change-form-btn owisp-phone-number-change-submit-btn owisp-btn-primary"
                        id="owisp-phone-number-change-submit-btn"
                        value={getText(buttons.change_phone_number.text, language)}
                      />
                    </>
                  ) : null}

                  {buttons.cancel ? (
                    <a className="owisp-btn-primary full-line"
                       id="owisp-phone-number-change-cancel-btn"
                       href={`/${orgSlug}/sms-verification`}>
                      {getText(buttons.cancel.text, language)}
                    </a>
                  ) : null}
                </form>
              </div>
              <div className="owisp-phone-number-change-contact-container">
                <Contact />
              </div>
            </div>
          </div>
        </>
    );
  }
}
export default withRouter(PhoneNumberChange);
PhoneNumberChange.contextType = LoadingContext;
PhoneNumberChange.propTypes = {
  settings: PropTypes.shape({
    sms_verification: PropTypes.bool
  }).isRequired,
  input_fields: PropTypes.shape({
    phone_number: PropTypes.shape({
      label: PropTypes.object,
      placeholder: PropTypes.object,
      country: PropTypes.string.isRequired,
      only_countries: PropTypes.array,
      preferred_countries: PropTypes.array,
      exclude_countries: PropTypes.array,
      enable_search: PropTypes.bool
    }),
  }),
  buttons: PropTypes.shape({
    change_phone_number: PropTypes.shape({
      text: PropTypes.object
    }),
  }),
  language: PropTypes.string.isRequired,
  orgSlug: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
};
