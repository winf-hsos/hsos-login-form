import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import 'hsos-firebase';

/**
 * `hsos-login-form`
 * A login form in a Polymer 3 web component. Connected to Firebase authentication.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class HsosLoginForm extends PolymerElement {

  static get template() {
    return html`
            <style>
              :host { 
                display: block;
              }
              
              paper-button {
                margin-top: 0.5em;
                margin-left: 0em;
                color: white;
                background-color: var(--primary-color);
              }
              
              paper-button[disabled] {
                margin-top: 0.7em;
                margin-left: 0em;
                color: white;
                background-color: #BDBDBD;
              }
              
              #message {
                color: var(--error-color)
              }
            </style>
            
            <paper-input id="inputEmail" type="email" label="[[userNameHeader]]" placeholder="[[userValuePlaceholder]]" required></paper-input>
            <paper-input id="inputPassword" type="password" label="[[passwordHeader]]" placeholder="[[passwordValuePlaceholder]]" required></paper-input>
            <div id="message"></div>
            <paper-button id="btnLogin" on-click="_login" raised>[[loginButtonText]]</paper-button>
            <paper-button id="btnLogout" on-click="_logout" raised hidden>[[logoutButtonText]]</paper-button>
          
        `;
  }

  static get properties() {
    return {
      configFile: { type: String, value: "config.json" },

      userNameHeader: { type: String, value: "E-Mail" },
      passwordHeader: { type: String, value: "Password" },
      userValuePlaceholder: { type: String, value: "" },
      passwordValuePlaceholder: { type: String, value: "" },
      loginButtonText: { type: String, value: "Login" },
      logoutButtonText: { type: String, value: "Logout" },
    }
  }

  constructor() {
    super();
    firebase.auth().onAuthStateChanged(this._loginChanged.bind(this));

    // Make invisible until config read and values are set
    this.setAttribute("hidden", "");

    this.loginClicked = false;
    this.logoutClicked = false;
  }

  ready() {
    super.ready();
    this._configure();
  }

  _configure() {

    var _this = this;
    var requestURL = this.configFile;
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send(null);

    request.onload = function () {

      var config = request.response;

      if (typeof config.hsosLoginForm == "undefined")
        return;

      if (typeof config.hsosLoginForm.userNameHeader !== "undefined") {
        _this.userNameHeader = config.hsosLoginForm.userNameHeader;
      }

      if (typeof config.hsosLoginForm.passwordHeader !== "undefined") {
        _this.passwordHeader = config.hsosLoginForm.passwordHeader;
      }

      if (typeof config.hsosLoginForm.userValuePlaceholder !== "undefined") {
        _this.userValuePlaceholder = config.hsosLoginForm.userValuePlaceholder;
      }

      if (typeof config.hsosLoginForm.passwordValuePlaceholder !== "undefined") {
        _this.passwordValuePlaceholder = config.hsosLoginForm.passwordValuePlaceholder;
      }

      if (typeof config.hsosLoginForm.loginButtonText !== "undefined") {
        _this.loginButtonText = config.hsosLoginForm.loginButtonText;
      }

      if (typeof config.hsosLoginForm.logoutButtonText !== "undefined") {
        _this.logoutButtonText = config.hsosLoginForm.logoutButtonText;
      }

      // Make visible again
      _this.removeAttribute("hidden");
    }
  }

  _login() {

    this.$.message.innerHTML = "";

    if (!this.$.inputEmail.validate() || !this.$.inputPassword.validate())
      return;

    var username = this.$.inputEmail.value;
    var password = this.$.inputPassword.value;

    this.loginClicked = true;
    firebase.auth().signInWithEmailAndPassword(username, password).catch(this._handleError.bind(this));
  }


  _logout() {
    this.logoutClicked = true;
    firebase.auth().signOut().catch(this._handleError);
  }

  _loginChanged(user) {

    if (user) {
      console.log("User with email >" + user.email + "< signed in.");

      // Disable login button, show logout button
      this.$.btnLogin.setAttribute("disabled", "");
      this.$.btnLogout.removeAttribute("hidden");

      // Clear and disable input fields
      this.$.inputEmail.value = "";
      this.$.inputEmail.setAttribute("disabled", "");
      this.$.inputPassword.value = "";
      this.$.inputPassword.setAttribute("disabled", "");

      if (this.loginClicked === true) {
        console.log("User successfully signed in.");
      }

    }
    else {
      console.log("No user signed in.");

      // Enable login button, hide logout button
      this.$.btnLogin.removeAttribute("disabled");
      this.$.btnLogout.setAttribute("hidden", "");

      this.$.inputEmail.removeAttribute("disabled");
      this.$.inputPassword.removeAttribute("disabled");

      if (this.logoutClicked === true) {
        console.log("User successfully signed out.");
      }
    }
  }

  _handleError(error) {
    var customMessage;

    switch (error.code) {
      case 'auth/invalid-email':
        customMessage = error.message;
        break;
      case 'auth/wrong-password':
        customMessage = error.message;
        break;
      case 'auth/user-not-found':
        customMessage = error.message;
        break;
      default:
        customMessage = error.message;
        break;
    }

    console.error(customMessage);
    this.$.message.innerHTML = customMessage;

  }

}

customElements.define('hsos-login-form', HsosLoginForm);