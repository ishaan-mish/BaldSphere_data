document.getElementById('dataForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Get form data
    const word = document.getElementById('word').value;
    const action = document.getElementById('action').value;
    const area_of_brain = document.getElementById('area_of_brain').value;

    if (!word || !action || !area_of_brain) {
        alert('All fields are required!');
        return;
    }

    const data = {
        word,
        action,
        area_of_brain
    };

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Data saved successfully!');
        } else {
            alert('Failed to save data!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error occurred while submitting data.');
    }
});

document.getElementById('downloadBtn').addEventListener('click', async function() {
    try {
        const response = await fetch('/download');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Error downloading file');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error downloading file');
    }
});
