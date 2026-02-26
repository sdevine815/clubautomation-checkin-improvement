var target = document.querySelector("#checkin-middle");

function addButtons(data) {    
    let buttonGroup = document.createElement("div");
    buttonGroup.innerHTML = `
        <style>
        .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 12px;
        }

        .btn {
        flex: 1;
        text-align: center;
        padding: 10px 14px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.15s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .btn-primary {
        background: #111827;
        color: #ffffff;
        }

        .btn-primary:hover {
        background: #000000;
        }

        .btn-secondary {
        background: #f3f4f6;
        color: #111827;
        border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover {
        background: #e5e7eb;
        }
        </style>
        `;
    
    let innerDiv = document.createElement("div");
        innerDiv.className = "action-buttons"

    let posButton = document.createElement("a");
        posButton.href = "https://wolffitbrig.clubautomation.com/payment?user=" + data.childNodes[1].value;
        posButton.innerText = "POS";
        posButton.className = "btn btn-primary"
        innerDiv.appendChild(posButton);

    let accButton = document.createElement("a");
        accButton.href = "https://wolffitbrig.clubautomation.com/user/edit?id=" + data.childNodes[1].value;
        accButton.innerText = "Account";
        accButton.className = "btn btn-secondary"
        innerDiv.appendChild(accButton);

    buttonGroup.appendChild(innerDiv)

    data.appendChild(buttonGroup)

    getMembershipData(data.childNodes[1].value, data)
}

async function getMembershipData(MEMBER_ID, data) {
    let bearerRequest = await fetch("https://wolffitbrig.clubautomation.com/client/auth/authorize-current-user", {
        "body": null,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(res => res.json());

    let dataRequest = await fetch("https://wolffitbrig.clubautomation.com/api/group/user/subscriptions?x-api-version=v1&id=" + MEMBER_ID, {
        "headers": { "authorization": `Bearer ${bearerRequest.access_token}` },
        "body": null,
        "method": "GET"
    }).then(res => res.json());

    let memberships = dataRequest.data;
    let active = memberships.filter(({ status }) => status == "active");
    let formatted = active.map(membership => {
        return membership.groupBillingInfo.billingType == "recurring" ? { 
            renews: membership.calculatedFees?.[0].billDate, 
            price: membership.calculatedFees?.[0].billAmount 
        } : { 
            expires: membership.expirationDate,
            paid: membership.activationFees.reduce((accumulator, currentValue) => accumulator + currentValue.billAmount, 0)
        };
    })
    
    let membershipsContainer = document.createElement("div");
        membershipsContainer.innerHTML = `
        <style>
        .item-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        margin-bottom: 8px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: box-shadow 0.15s ease;
        }

        .item-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .item-left {
        display: flex;
        flex-direction: column;
        }

        .item-label {
        font-size: 12px;
        color: #6b7280;
        }

        .item-date {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        }

        .item-price {
        font-size: 16px;
        font-weight: 700;
        color: #16a34a;
        }
        </style>

        `

    formatted.forEach(membership => {
        let header = membership?.expires ? "Expires (Flat Pass)" : "Renews (Recurring)";
        let price = membership?.price ? (`$${membership.price}`) : (`Paid $${membership.paid}`)
        
        let membershipContainer = document.createElement("div");
            membershipContainer.className = "item-card";
            membershipContainer.innerHTML = `        
                <div class="item-left">
                    <div class="item-label">${header}</div>
                    <div class="item-date">${membership?.renews ?? membership?.expires}</div>
                </div>
                <div class="item-right">
                    <div class="item-price">${price}</div>
                </div>
            `;
        membershipsContainer.appendChild(membershipContainer)

    })

    data.appendChild(membershipsContainer)
}

if (target.childNodes.length > 0) { addButtons(document.querySelector("#user-info")); }

new MutationObserver((mut) => addButtons(mut.at(-2).addedNodes[1])).observe(target, { childList: true });
