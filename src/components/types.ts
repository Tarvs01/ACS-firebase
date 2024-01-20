export interface StaffData {
    dept: string;
    defaulters: {
      id: number;
      matricNumber: string;
      offences: { id: number; description: string; date: string }[];
    }[];
  }
  
  export interface DefaulterDetails {
    props: StaffData["defaulters"][0];
    updateState: React.Dispatch<React.SetStateAction<StaffData>>;
    openDefaulter: (newOpenDefaulter: React.Dispatch<React.SetStateAction<boolean>>, id: number) => void;
    staffData: StaffData;
  }
  
  export interface ContextDetails {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    isStaffLoggedIn: boolean;
    setIsStaffLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    isAdminLoggedIn: boolean;
    setIsAdminLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    currentStaffUID: string;
    setCurrentStaffUID: React.Dispatch<React.SetStateAction<string>>;
  }

  export interface StudentDetails{
    crc: string;
    deptHod: string;
    deptLab: string;
    deptOfficer: string;
    library: string;
    matricNumber: string;
  }
  
  //https://youtube.com/shorts/dR-1x1qO9b4?si=waT3AmMv3PtjENQz