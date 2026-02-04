// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public owner;
    uint256 public nextCertificateId = 1;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ban khong phai admin");
        _;
    }

    struct Certificate {
        uint256 id;
        string studentId;
        string studentName;
        string certificateName;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(uint256 => Certificate) private certificates;
    mapping(string => uint256[]) private certificatesOfStudent;
    mapping(string => mapping(string => bool)) public hasCertificate; // studentId => certificateName => bool

    event CertificateIssued(
        uint256 id,
        string studentId,
        string studentName,
        string certificateName
    );

    event CertificateRevoked(uint256 id);

    // ✅ CẤP CHỨNG CHỈ (ID TỰ TĂNG)
    function issueCertificate(
        string memory _studentId,
        string memory _studentName,
        string memory _certificateName
    ) public onlyOwner {
        require(
            !hasCertificate[_studentId][_certificateName],
            "Certificate already issued"
        );

        uint256 id = nextCertificateId++;

        certificates[id] = Certificate(
            id,
            _studentId,
            _studentName,
            _certificateName,
            block.timestamp,
            false
        );

        certificatesOfStudent[_studentId].push(id);
        hasCertificate[_studentId][_certificateName] = true;

        emit CertificateIssued(
            id,
            _studentId,
            _studentName,
            _certificateName
        );
    }

    // ✅ THU HỒI THEO ID
    function revokeCertificate(uint256 _id) public onlyOwner {
        require(certificates[_id].id != 0, "Khong ton tai");
        Certificate storage cert = certificates[_id];
        require(
            hasCertificate[cert.studentId][cert.certificateName],
            "Certificate not active"
        );
        
        cert.revoked = true;
        hasCertificate[cert.studentId][cert.certificateName] = false;

        emit CertificateRevoked(_id);
    }

    // ✅ TRA CỨU THEO ID
    function getCertificate(uint256 _id)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        Certificate memory c = certificates[_id];
        require(c.id != 0, "Khong ton tai");

        return (
            c.id,
            c.studentId,
            c.studentName,
            c.certificateName,
            c.issuedAt,
            c.revoked
        );
    }

    // ✅ LẤY DANH SÁCH CHỨNG CHỈ CỦA SV
    function getCertificatesOfStudent(string memory _studentId)
        public
        view
        returns (uint256[] memory)
    {
        return certificatesOfStudent[_studentId];
    }
}
