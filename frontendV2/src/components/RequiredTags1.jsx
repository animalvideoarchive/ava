import useFormContext from "../hooks/useFormContext"

const RequiredTags1 = () => {
    const { data, handleChange } = useFormContext()

    const content = (
        <div className="split-container">
            <div className="flex-col-left">
                <div className="flex-col">
                    <label htmlFor="contactEmail">Contact Email <span className="required">*</span></label>
                    <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        placeholder="abc@example.com"
                        required
                        value={data.contactEmail}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="flex-col">
                    <label htmlFor="commonName">Common Name <span className="required">*</span>
                        <span className="tooltip" title="Please use the IUCN red list for consistency of names.">?</span>
                    </label>
                    <input
                        type="text"
                        id="commonName"
                        name="commonName"
                        placeholder="Enter common name"
                        pattern="[\w\s]{2,}"
                        required
                        value={data.commonName}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex-col">
                    <label htmlFor="contactName">Contact Name <span className="required">*</span></label>
                    <div className="split-name">
                        <input
                            type="text"
                            id="contactFirstName"
                            name="contactFirstName"
                            placeholder="First Name"
                            pattern="([A-Z])[\w+.]{1,}"
                            required
                            value={data.contactFirstName}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            id="contactLastName"
                            name="contactLastName"
                            placeholder="Last Name"
                            pattern="([A-Z])[\w+.]{1,}"
                            required
                            value={data.contactLastName}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-col-right">
                <div className="flex-col">
                    <label htmlFor="briefVideoDescription">Brief description of video(s) <span className="required">*</span></label>
                        <textarea
                        type="text"
                        id="briefVideoDescription"
                        name="briefVideoDescription"
                        placeholder="Describe the video(s)"
                        required
                        value={data.briefVideoDescription}
                        onChange={handleChange}                
                    />
                </div>
            </div>
        </div>
    )

    return content
}

export default RequiredTags1
