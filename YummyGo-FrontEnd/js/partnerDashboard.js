$(document).ready(async function() {
    console.log("Partner Dashboard JS loaded");

    const userId = sessionStorage.getItem("userId");
    const $riderContainer = $('#rider-save-introduction-container');
    const $statusToggleBtn = $("#statusToggleBtn");
    const backendUrl = "http://localhost:8080/api/v1/vehicle";

    // Check if user already has a vehicle
    async function checkUserVehicle() {
        const token = (await cookieStore.get('token'))?.value;
        if (!token || !userId) return;

        $.ajax({
            url: `http://localhost:8080/api/v1/vehicle/user/${userId}`,
            method: "GET",
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(response) {
                if (response && response.length > 0) {
                    // User has vehicle(s) => hide introduction container
                    $riderContainer.hide();
                } else {
                    $riderContainer.show();
                }
            },
            error: function(err) {
                console.error("Failed to fetch vehicles:", err);
                $riderContainer.show();
            }
        });
    }

    checkUserVehicle();

    // -------------------------------
    // Vehicle form logic remains the same
    // -------------------------------

    const $vehicleCategory = $('#vehicleCategory');
    const $licenseNumber = $('#vehicleLicenseNumber');
    const $vehicleNumber = $('#vehicleNumber');
    const $vehicleImage = $('#vehicleImage');

    // Hide/Show fields based on category
    $vehicleCategory.change(function() {
        if ($vehicleCategory.val() === "Bicycle") {
            $licenseNumber.closest('.mb-3').hide();
            $vehicleNumber.closest('.mb-3').hide();
        } else {
            $licenseNumber.closest('.mb-3').show();
            $vehicleNumber.closest('.mb-3').show();
        }
    }).trigger('change'); // trigger on load

    // Drag & drop preview for vehicle image
    const $previewContainer = $('<div class="dz-preview mb-3"></div>').insertAfter($vehicleImage);
    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file only.");
            return;
        }
        const url = URL.createObjectURL(file);
        $previewContainer.html(`<div class="position-relative"><img src="${url}" class="img-fluid rounded"><button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0">Remove</button></div>`);

        $previewContainer.find('button').click(function() {
            $vehicleImage.val("");
            $previewContainer.empty();
            URL.revokeObjectURL(url);
        });
    }

    $vehicleImage.on("change", function() {
        const file = this.files[0];
        if (file) handleFile(file);
    });

    $previewContainer.parent().on("dragover", function(e) {
        e.preventDefault();
        $(this).addClass("dragover");
    }).on("dragleave dragend", function(e) {
        e.preventDefault();
        $(this).removeClass("dragover");
    }).on("drop", function(e) {
        e.preventDefault();
        $(this).removeClass("dragover");
        const file = e.originalEvent.dataTransfer.files[0];
        if (file) {
            $vehicleImage[0].files = e.originalEvent.dataTransfer.files;
            handleFile(file);
        }
    });

    // Submit form
    $('#vehicleSaveForm').submit(async function(e) {
        e.preventDefault();

        const token = (await cookieStore.get('token'))?.value;
        if (!token) {
            Swal.fire({ icon: "warning", title: "Not Authenticated", text: "User not authenticated!" });
            return;
        }

        if (!$vehicleImage[0].files.length) {
            Swal.fire({ icon: "warning", title: "No Image", text: "Please upload vehicle image!" });
            return;
        }

        const formData = new FormData();
        const category = $vehicleCategory.val();
        formData.append('vehicleCategory', category);
        formData.append('vehicleImage', $vehicleImage[0].files[0]);
        formData.append('vehicleStatus', 'PENDING');
        formData.append('userId', userId);

        if (category === "Bicycle") {
            formData.append('licenseNumber', 'no');
            formData.append('vehicleNumber', 'no');
            formData.append('IDNumber', $('#idNumber').val());
        } else {
            formData.append('licenseNumber', $licenseNumber.val());
            formData.append('vehicleNumber', $vehicleNumber.val());
            formData.append('IDNumber', $('#idNumber').val());
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/vehicle/create",
            method: "POST",
            headers: { 'Authorization': 'Bearer ' + token },
            processData: false,
            contentType: false,
            data: formData,
            success: function(response) {
                Swal.fire({ icon: "success", title: "Success", text: "Vehicle saved successfully!" });
                $('#vehicleSaveForm')[0].reset();
                $previewContainer.empty();
                $licenseNumber.closest('.mb-3').show();
                $vehicleNumber.closest('.mb-3').show();

                // Hide container since user now has a vehicle
                $riderContainer.hide();
            },
            error: function(xhr, status, error) {
                console.error("Error saving vehicle:", xhr.responseText || error);
                Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while saving the vehicle!" });
            }
        });
    });

    // ==========================
    // Check if user already has a vehicle
    // ==========================
    async function checkUserVehicle() {
        const token = (await cookieStore.get('token'))?.value;
        if (!token || !userId) return;

        $.ajax({
            url: `${backendUrl}/user/${userId}`,
            method: "GET",
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(response) {
                if (response && response.length > 0) {
                    $riderContainer.hide();
                    updateStatusButton(response[0].vehicleStatus);
                } else {
                    $riderContainer.show();
                }
            },
            error: function(err) {
                console.error("Failed to fetch vehicles:", err);
                $riderContainer.show();
            }
        });
    }

    // ==========================
    // Update button UI
    // ==========================
    function updateStatusButton(status) {
        if (status === "Active") {
            $statusToggleBtn
                .removeClass("btn-danger")
                .addClass("btn-success")
                .text("Active");
        } else {
            $statusToggleBtn
                .removeClass("btn-success")
                .addClass("btn-danger")
                .text("Inactive");
        }
    }

    // ==========================
    // Toggle status on click
    // ==========================
    $statusToggleBtn.click(async function () {
        const currentStatus = $(this).text().trim();
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

        try {
            const cookie = await cookieStore.get("token");
            const token = cookie?.value;

            await $.ajax({
                url: `${backendUrl}/updateStatus/${userId}`,
                method: "PUT",
                contentType: "application/json",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: JSON.stringify({ vehicleStatus: newStatus })
            });

            updateStatusButton(newStatus);
        } catch (err) {
            console.error("Error updating vehicle status:", err);
        }
    });

    // 🔥 Run on load
    checkUserVehicle();
});
