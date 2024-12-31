class FileChunker {
  private file: File;
  private chunkSize: number;
  private totalChunks: number;

  constructor(file: File, chunkSize: number) {
    if (!(file instanceof File)) {
      throw new Error("The first argument must be a File object.");
    }
    if (typeof chunkSize !== "number" || chunkSize <= 0) {
      throw new Error("The chunk size must be a positive number.");
    }

    this.file = file;
    this.chunkSize = chunkSize;
    this.totalChunks = Math.ceil(file.size / chunkSize);
  }

  // Returns the total number of chunks needed
  info(): number {
    return this.totalChunks;
  }

  // Processes the file in chunks and invokes the callback for each chunk
  start(onChunk: (chunkData: ArrayBuffer, chunkIndex: number) => void): void {
    if (typeof onChunk !== "function") {
      throw new Error("The onChunk callback must be a function.");
    }

    let currentChunk = 0;
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      if (event.target && event.target.result) {
        const chunkData = event.target.result as ArrayBuffer;
        onChunk(chunkData, currentChunk);
        currentChunk++;

        if (currentChunk < this.totalChunks) {
          this.readNextChunk(currentChunk, fileReader);
        }
      }
    };

    fileReader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    this.readNextChunk(currentChunk, fileReader);
  }

  // Reads the next chunk using FileReader
  private readNextChunk(chunkIndex: number, fileReader: FileReader): void {
    const start = chunkIndex * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.file.size);
    const blob = this.file.slice(start, end);
    fileReader.readAsArrayBuffer(blob);
  }
}

export default FileChunker;
