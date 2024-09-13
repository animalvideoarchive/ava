import useFormContext from "../hooks/useFormContext";
import VideoSelection from "./VideoSelection";
import RequiredTags1 from "./RequiredTags1";
import RequiredTags2 from "./RequiredTags2";
import OptionalTags1 from "./OptionalTags1";
import OptionalTags2 from "./OptionalTags2";
import VideoUpload from "./VideoUpload";
import AdminDashboard from "./AdminDashboard";
import '../index.css'
const FormInputs = () => {

    const { page } = useFormContext()

    const display = {
        0: <AdminDashboard/>,
        1: <VideoSelection/>,
        2: <RequiredTags1 />,
        3: <RequiredTags2 />,
        4: <OptionalTags1 />,
        5: <OptionalTags2 />,
        6: <VideoUpload />
    }

    const content = (
        
        <div>
            {display[page]}
        </div>
    )


    return content
}
export default FormInputs