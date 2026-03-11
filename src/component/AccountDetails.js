import React from "react";

export default function AccountDetails({ formData }) {
  return (
    <div>
      <section className="main-section p-4">
        <h1>Account Opening</h1>
        <div className="shadowBox">
          <div className="row">
            {/* Meta Data Section */}
            <div className="col-md-12">
              <div className="metaData">
                <h2>Meta Data</h2>
                <div className="formData">
                  <div className="row">
                    {formData?.metaData.map(
                      (
                        { label, type, required, options, disabled, value },
                        idx
                      ) => (
                        <div className="col-md-4" key={idx}>
                          <div className="form-group">
                            <label>
                              {label}
                              {required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            {type === "select" ? (
                              <select
                                className="form-control"
                                disabled={disabled}
                              >
                                {options.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={type}
                                className="form-control"
                                disabled={disabled}
                                defaultValue={value}
                              />
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="custInfo mt-4 bgLightBlue">
                <h2 className="bgHead">Customer Details</h2>
                <div className="custData pt-4">
                  {formData.customerDetails.map(
                    ({ customerName, birthDateLabel, genderLabel }, idx) => (
                      <div className="row" key={idx}>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>
                              {customerName}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Deepak"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>
                              {birthDateLabel}
                              <span className="text-danger">*</span>
                            </label>
                            <input type="date" className="form-control" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>
                              {genderLabel}
                              <span className="text-danger">*</span>
                            </label>
                            <select className="form-control">
                              <option>Select</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Additional Documents Section */}
            <div className="col-md-6 mt-4">
              <div className="bgLightBlue">
                <h2>Additional Documents</h2>
                <div className="bgWhite">
                  <div className="row">
                    {formData.additionalDocuments.map(
                      ({ label, type, options, placeholder }, idx) => (
                        <div className="col-md-6" key={idx}>
                          <div className="form-group">
                            <label>{label}</label>
                            {type === "select" ? (
                              <select className="form-control">
                                {options.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={type}
                                className="form-control"
                                placeholder={placeholder}
                              />
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Section */}
            <div className="col-md-6 mt-4">
              <div className="bgLightBlue">
                <h2>Decision</h2>
                <div className="bgWhite">
                  {formData.decision.map(
                    ({ label, type, placeholder }, idx) => (
                      <div className="form-group" key={idx}>
                        <label>{label}</label>
                        <input
                          type={type}
                          className="form-control"
                          placeholder={placeholder}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Attached Documents Section */}
            <div className="col-md-12 mt-4">
              <div className="bgLightBlue">
                <h2>Attached Documents</h2>
                {formData.attachedDocuments.map(
                  (
                    {
                      doc1Label,
                      doc1Placeholder,
                      doc2Label,
                      doc2Placeholder,
                      attachment,
                    },
                    idx
                  ) => (
                    <div className="bgWhite mb-2" key={idx}>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>{doc1Label}</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={doc1Placeholder}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>
                              {doc2Label}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={doc2Placeholder}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group attachmentbox">
                            <div className="attchbox">
                              <div className="leftCnt">
                                <div className="d-flex align-items-center">
                                  <i className="fa fa-file-pdf-o"></i>{" "}
                                  <span className="fileSize">
                                    {attachment.fileName}
                                    <br />
                                    <small>{attachment.fileSize}</small>
                                  </span>
                                </div>
                              </div>
                              <div className="deleteBox">
                                <i className="fa fa-eye"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
