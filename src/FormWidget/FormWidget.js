import React, { Component } from "react";
import axios from "axios";
// import Navbar from '../Navbar/Navbar.js'
import TextField from './inputs/TextField/TextField.js';
import FilePicker from './inputs/FilePicker/FilePicker.js';
import "./FormWidget.css";

class FormWidget extends Component {
  constructor() {
    super();
    this.state = {
      coachId: 354,
      newLeadInfo: {
        givenName: "",
        familyName: "",
        email: "",
        phone: "",
        campaignId: 0
      },
      uploadFile: null,
      isSubmitted: false,
      fileReader: null,
      buttonText: 'Submit',
      fieldContainers: [],
    };
  }

  componentDidMount() {
    // TODO: remove this once form is initialized from widget in Clickfunnels
    // Comment out the below funtion if you want to test form without having a file picker
    this.initializeForm(354, 0, 'Submit Resume', {
      title: "resume-upload",
      label: "Resume Upload",
      required: false,
    });
  }

  // TODO: initialize form from Clickfunnels widget
  initializeForm = (coachId, campaignId, buttonText, uploadFile) => {
    const newState = this.state;
    newState.coachId = coachId;
    newState.newLeadInfo.campaignId = campaignId;
    newState.buttonText = buttonText;
    if (uploadFile !== null) {
      uploadFile.data = "";
      newState.uploadFile = uploadFile;
    }
    this.setState(newState);
  };

  postLeadInfo = async newLeadInfo => {
    if (this.state.uploadFile && this.state.uploadFile.data) {
      await this.getFileUrl();
      await axios({
        method: "put",
        url: this.state.uploadFile.putUrl,
        data: this.state.uploadFile.data,
        headers: { "content-type": "binary/octet-stream" }
      }).then(response => {
        console.log("upload", response);
        console.log("access url", this.state.uploadFile.accessUrl);
      });
    }
    axios
      .post(
        `https://stage.api.soar.com/v1/CRM/Lead/${this.state.coachId}`,
        this.state.newLeadInfo
      )
      .then(res => {
        console.log("success:", res);
      })
      .catch(e => {
        // TODO: handle error
        console.log(e);
      });
  };

  getFileUrl = async () => {
    await axios
      .get(
        `https://stage.api.soar.com/v1/Asset/upload/${this.state.uploadFile.title}.${this.state.uploadFile.type}`
      )
      .then(res => {
        console.log("success:", res);
        const newState = this.state;
        newState.uploadFile.putUrl = res.data.putUrl;
        newState.uploadFile.accessUrl = res.data.accessUrl;
        newState.newLeadInfo.uploadUrls = [
          {
            label: newState.uploadFile.label,
            url: newState.uploadFile.accessUrl,
          },
        ]
        this.setState(newState);
      })
      .catch(e => {
        // TODO: handle error
        console.log(e);
      });
  };

  formIsValid = () => {
    return this.state.fieldContainers
      .every(val => val.isValid === true)
  }

  registerTextField = fieldContainer => {
    const newFieldContainers = this.state.fieldContainers
    const releventIndex = newFieldContainers.findIndex(val => val.id === fieldContainer.id)
    if (releventIndex >= 0) {
      newFieldContainers.splice(releventIndex, 1, fieldContainer)
    } else {
      newFieldContainers.push(fieldContainer)
    }
    this.setState({ fieldContainers: newFieldContainers })
  }

  handleChange = e => {
    const newState = this.state
    newState.newLeadInfo[e.target.name] = e.target.value
    this.setState(newState)
  };

  onSelectFile = e => {
    const uploadFile = this.state.uploadFile
    const data = e.target.files[0]
    if (data) {
      uploadFile.value = data.name
      uploadFile.data = data
      const blob = data.name.split(".")
      uploadFile.type = blob[blob.length - 1]
      this.setState({ uploadFile })
    } else {
      uploadFile.value = null
      uploadFile.data = null
      uploadFile.type = null
    }
    this.setState({ uploadFile })
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.formIsValid()) {
      this.postLeadInfo();
      const newState = this.state;
      newState.isSubmitted = true;
      this.setState(newState);
    }
  };

  render() {
    console.log(this.state);
    if (!this.state.isSubmitted) {
      return (
        <div>
          <div className="formDiv">
            <form className="mainForm" onSubmit={this.handleSubmit}>
              <TextField
                type="text"
                label="First Name"
                name="givenName"
                value={this.state.newLeadInfo.givenName}
                handleChange={this.handleChange}
                registerTextField={this.registerTextField}
                required={ true }
              />
              <TextField
                type="text"
                label="Last Name"
                name="familyName"
                value={this.state.newLeadInfo.familyName}
                handleChange={this.handleChange}
                registerTextField={this.registerTextField}
                required={ true }
              />
              <TextField
                type="email"
                label="Email"
                name="email"
                value={this.state.newLeadInfo.email}
                handleChange={this.handleChange}
                registerTextField={this.registerTextField}
                required={ true }
              />
              <TextField
                type="tel"
                label="Phone Number"
                name="phone"
                value={this.state.newLeadInfo.phone}
                handleChange={this.handleChange}
                registerTextField={this.registerTextField}
                required={ false }
              />
              <div
                style={{
                  display: this.state.uploadFile ? '' : 'none'
                }}
              >
                <FilePicker
                  label={this.state.uploadFile ? this.state.uploadFile.label : ''}
                  value={this.state.uploadFile ? this.state.uploadFile.value : ''}
                  name="resumeUpload"
                  accept=".pdf, .doc, .docx"
                  handleChange={this.onSelectFile}
                  required={this.state.uploadFile ? this.state.uploadFile.required : false}
                  registerTextField={this.registerTextField}
                />
              </div>
              <div>
                <button className={this.formIsValid() ? 'button' : 'button disabled'}>{this.state.buttonText}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }
    return <div>Thank You</div>;
  }
}

export default FormWidget;