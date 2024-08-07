import React, {useState, useEffect} from 'react';
import AppLayout from '../../components/applayout/AppLayout'
import '../../components/applayout/styles.css'
import requestApi from '../../components/utils/axios';
import RoleCheck from '../auth/RoleResource/resources';

function Attendence(props){
    const rId = 3
    const [roleIds, setRoleIds] = useState(null);

    useEffect(() => {
        const fetchRoleIds = async () => {
            try {
                const response = await requestApi("GET",`/auth/rolecheck?resources_id=${rId}`);
                setRoleIds(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching role IDs:", error);
            }
        };

        fetchRoleIds();
    }, [rId]);

    if (roleIds === null) {
        return <div>Loading...</div>; 
    }
    const RoleCheckedExplore = RoleCheck(() => (
        <AppLayout rId={rId} body={<Body />} />
    ), roleIds);

    return <RoleCheckedExplore {...props} />;
};



function Body(){
    return (
        <div>
            Attendence Page
        </div>
    )

}

export default Attendence