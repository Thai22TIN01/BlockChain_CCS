// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public owner;

    constructor() {
        owner = msg.sender; // ví deploy = admin (nhà trường)
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ban khong phai admin");
        _;
    }

    struct Certificate {
        string studentId;
        string studentName;
        string certificateName;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(
        string studentId,
        string studentName,
        string certificateName,
        uint256 issuedAt
    );

    event CertificateRevoked(string studentId, uint256 revokedAt);

    // ✅ CẤP CHỨNG CHỈ
    function issueCertificate(
        string memory _studentId,
        string memory _studentName,
        string memory _certificateName
    ) public onlyOwner {
        certificates[_studentId] = Certificate(
            _studentId,
            _studentName,
            _certificateName,
            block.timestamp,
            false
        );

        emit CertificateIssued(
            _studentId,
            _studentName,
            _certificateName,
            block.timestamp
        );
    }

    // ✅ THU HỒI
    function revokeCertificate(string memory _studentId) public onlyOwner {
        require(bytes(certificates[_studentId].studentId).length != 0, "Chua cap");
        certificates[_studentId].revoked = true;

        emit CertificateRevoked(_studentId, block.timestamp);
    }

    // ✅ SINH VIÊN / BÊN THỨ 3 TRA CỨU
    function getCertificate(string memory _studentId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        Certificate memory c = certificates[_studentId];
        require(bytes(c.studentId).length != 0, "Khong ton tai");

        return (
            c.studentId,
            c.studentName,
            c.certificateName,
            c.issuedAt,
            c.revoked
        );
    }
}
