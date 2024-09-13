import useFormContext from "../hooks/useFormContext";
import VideoSelection from "./VideoSelection";
import RequiredTags1 from "./RequiredTags1";
import RequiredTags2 from "./RequiredTags2";
import OptionalTags1 from "./OptionalTags1";
import OptionalTags2 from "./OptionalTags2";
import VideoUpload from "./VideoUpload";
import '../index.css'
const FormInputs = () => {

    const { page } = useFormContext()

    const display = {
        0: <VideoSelection/>,
        1: <RequiredTags1 />,
        2: <RequiredTags2 />,
        3: <OptionalTags1 />,
        4: <OptionalTags2 />,
        5: <VideoUpload />
    }

    const content = (
        
        <div>
            {display[page]}
        </div>
    )


    return content
}
export default FormInputs