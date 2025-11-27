import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const reportApi = {
  // ✅ Lấy danh sách report (cho admin)
  getReports: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_URL}/admin/reports`, { headers });
    // Trả về danh sách report (Spring trả Page)
    return res.data.content || res.data;
  },

  // ✅ Cập nhật trạng thái report (resolve hoặc dismiss)
  updateReportStatus: async (id, status, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.put(
      `${API_URL}/admin/reports/${id}/status?status=${status}`,
      null,
      { headers }
    );
    return res.data;
  },

    updateReportSeverity: async (reportId, severity, token) => {
    return axios.put(
      `${API_URL}/admin/reports/${reportId}/severity`,
      null,
      {
        params: { severity },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
