/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable camelcase */
import axios from "axios";
import { shallow } from "enzyme";
import React from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router } from "react-router-dom";
import renderer from "react-test-renderer";
import { toast } from 'react-toastify';
import { loadingContextValue } from "../../utils/loading-context";
import getConfig from "../../utils/get-config";
import SmsVerification from "./sms-verification";

jest.mock("axios");
const defaultConfig = getConfig("default");
const createTestProps = props => {
  return {
    language: "en",
    orgSlug: "default",
    passwordConfirm: defaultConfig.components.confirm_form,
    match: {
      params: {
        uid: "testUid",
        token: "testToken",
      },
    },
    ...props,
  };
};

describe("<SmsVerification /> rendering", () => {
  let props;
  let wrapper;
  // beforeEach(() => {
  //   props = createTestProps();
  //   wrapper = shallow(<PasswordConfirm {...props} />);
  // });
  // it("should render correctly", () => {
  //   props = createTestProps();
  //   const component = renderer
  //     .create(
  //       <Router>
  //         <PasswordConfirm {...props} />
  //       </Router>,
  //     )
  //     .toJSON();
  //   expect(component).toMatchSnapshot();
  // });
  // it("should render 2 input fields", () => {
  //   expect(wrapper.find(".owisp-password-confirm-input")).toHaveLength(2);
  // });
  //
  // it("should render password field correctly", () => {
  //   const { password } = props.passwordConfirm.input_fields;
  //   expect(wrapper.find(".owisp-password-confirm-label-password").text()).toBe(
  //     password.label.en,
  //   );
  //   expect(
  //     wrapper
  //       .find(".owisp-password-confirm-input-password")
  //       .prop("placeholder"),
  //   ).toBe(password.placeholder.en);
  //   expect(
  //     wrapper.find(".owisp-password-confirm-input-password").prop("title"),
  //   ).toBe(password.pattern_description.en);
  //   expect(
  //     wrapper.find(".owisp-password-confirm-input-password").prop("type"),
  //   ).toBe(password.type);
  // });
  // it("should render password confirm field correctly", () => {
  //   const { password_confirm } = props.passwordConfirm.input_fields;
  //   expect(wrapper.find(".owisp-password-confirm-label-confirm").text()).toBe(
  //     password_confirm.label.en,
  //   );
  //   expect(
  //     wrapper.find(".owisp-password-confirm-input-confirm").prop("placeholder"),
  //   ).toBe(password_confirm.placeholder.en);
  //   expect(
  //     wrapper.find(".owisp-password-confirm-input-confirm").prop("title"),
  //   ).toBe(password_confirm.pattern_description.en);
  //   expect(
  //     wrapper.find(".owisp-password-confirm-input-confirm").prop("type"),
  //   ).toBe(password_confirm.type);
  // });
});
