# Video Reverser

Video Reverser is an offline-first web application that allows you to reverse videos directly in your browser. It's built with performance and privacy in mind, as no video data leaves your computer.

## Features

*   **Offline Video Reversal:** Reverse videos without uploading them to a server.
*   **Privacy-Focused:** All processing happens locally in your browser.
*   **Modern Web Technologies:** Utilizes native browser APIs like Canvas, MediaRecorder, and Web Audio API for video and audio manipulation.
*   **User-Friendly Interface:** Simple and intuitive interface for selecting and reversing videos.
*   **Installable PWA:** Can be installed as a Progressive Web App (PWA) for offline use.

## How it Works

The application processes videos directly in the browser using a combination of web technologies:
1.  **Frame Extraction:** When a video is selected, it's loaded into an HTML5 `<video>` element. The application then seeks through the video frame by frame. Each frame is drawn onto an HTML5 `<canvas>` element at the desired FPS. The canvas content (the frame image) is then converted to a data URL and stored.
2.  **Frame Reversal:** Once all frames are extracted, their order in the stored array is reversed.
3.  **Audio Reversal:** The audio track from the original video is extracted using the Web Audio API. The audio samples are reversed in order.
4.  **Video Re-encoding:** The reversed frames are drawn sequentially onto the canvas. This visual output, along with the reversed audio stream (if present), is captured using the MediaRecorder API to create a new video stream. This stream is then encoded into a WebM video format.
5.  **Download:** The resulting WebM video blob is made available for download.

## How to Use

1.  **Select a Video:** Click on the "Select Video" button to choose a video file from your computer.
2.  **Reverse Video:** Once a video is selected, click the "Reverse Video" button.
3.  **Wait for Processing:** The time taken to reverse the video depends on its size and length. A progress bar will indicate the status.
4.  **Download Reversed Video:** After processing is complete, a download link will appear. Click it to save the reversed video to your computer.

## Project Structure

*   **`index.html`**: The main HTML file for the application's user interface. It contains the HTML structure, CSS styles, and the core JavaScript logic for video processing (frame extraction, reversal, audio manipulation, and re-encoding using Canvas, Web Audio API, and MediaRecorder API).
*   **`manifest.json`**: The web app manifest file. It allows the application to be installed as a Progressive Web App (PWA), enabling users to add it to their home screen and use it offline. It defines metadata like the app's name, icons, start URL, and display mode.
*   **`service-worker.js`**: The service worker script that enables offline functionality by caching application assets.
*   **`LICENSE`**: Contains the license information for the project.
*   **`README.md`**: This file, providing information about the project.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
