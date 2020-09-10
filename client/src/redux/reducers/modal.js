const initialState = {
  isBigModalOpen: false,
  isSmallModalOpen: false,
  jobData: false,
  employeeData: false,
  addEmail: false,
  emailContainer: false,
  editTemplates: false,
  uploadResume: false,
  deleteEmployee: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case "JOB_DATA_MODAL":
      return { ...state, isBigModalOpen: true, jobData: true };

    case "EMPLOYEE_DATA_MODAL":
      return { ...state, isBigModalOpen: true, employeeData: true };
    case "ADD_EMAIL":
      return { ...state, isBigModalOpen: true, addEmail: true };
    case "EMAIL_CONTAINER":
      return { ...state, isBigModalOpen: true, emailContainer: true };
    case "DELETE_EMPLOYEE_MODAL":
      return { ...state, isSmallModalOpen: true, deleteEmployee: true };
    case "EDIT_TEMPLATES":
      return { ...state, isBigModalOpen: true, editTemplates: true };
    case "UPLOAD_RESUME":
      return { ...state, isBigModalOpen: true, uploadResume: true };
    case "CLOSE_MODAL":
      return {
        ...state,
        isBigModalOpen: false,
        isSmallModalOpen: false,
        jobData: false,
        employeeData: false,
        addEmail: false,
        emailContainer: false,
        editTemplates: false,
        uploadResume: false,
        deleteEmployee: false
      };
    default:
      return state;
  }
}
