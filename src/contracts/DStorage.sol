// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.5.0;

contract DStorage {
    // name of the contract
    string public name = "Decentralised Storage";

    // Number of files in the storage
    uint256 public fileCount = 0;

    // mapping(key => FileHash) file;
    mapping(uint256 => File) public files;

    // Structure for files
    struct File {
        uint256 fileId;
        string fileHash;
        uint256 fileSize;
        string fileType;
        string fileName;
        string fileDescription;
        uint256 uploadTime;
        address payable uploader;
    }

    // Event
    event FileUploaded(
        uint256 fileId,
        string fileHash,
        uint256 fileSize,
        string fileType,
        string fileName,
        string fileDescription,
        uint256 uploadTime,
        address payable uploader
    );

    constructor() public {}

    // Upload File function
    function uploadFile(
        string memory _fileHash,
        uint256 _fileSize,
        string memory _fileType,
        string memory _fileName,
        string memory _fileDescription
    ) public {
        // model file format:
        // file[number] = File(1, "0x123456789", 100, "image/png", "test.png", "test file", 1564654645/timestamp, 0x123456789/msg.sender);

        // Make sure the file hash exists
        require(bytes(_fileHash).length > 0);
        // Make sure file type exists
        require(bytes(_fileType).length > 0);
        // Make sure file description exists
        require(bytes(_fileDescription).length > 0);
        // Make sure file fileName exists
        require(bytes(_fileName).length > 0);
        // Make sure uploader address exists
        require(msg.sender != address(0));
        // Make sure file size is more than 0
        require(_fileSize > 0);

        // Increment file id
        fileCount ++; // fileCount = fileCount + 1;

        // Add File to the contract
        files[fileCount] = File(
            fileCount,
            _fileHash,
            _fileSize,
            _fileType,
            _fileName,
            _fileDescription,
            now,
            msg.sender
        );

        // Trigger an event
        emit FileUploaded(
            fileCount,
            _fileHash,
            _fileSize,
            _fileType,
            _fileName,
            _fileDescription,
            now,
            msg.sender
        );
    }
}
