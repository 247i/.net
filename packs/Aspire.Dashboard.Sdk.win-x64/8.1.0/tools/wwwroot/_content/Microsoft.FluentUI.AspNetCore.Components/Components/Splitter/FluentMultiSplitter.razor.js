export function startSplitterResize(
    el,
    splitter,
    paneId,
    paneNextId,
    orientation,
    clientPos,
    minValue,
    maxValue,
    minNextValue,
    maxNextValue) {

    //var el = document.getElementById(id);
    var pane = document.getElementById(paneId);
    var paneNext = document.getElementById(paneNextId);
    var paneLength;
    var paneNextLength;
    var panePerc;
    var paneNextPerc;
    var isHOrientation = orientation == 'Horizontal';

    var totalLength = 0.0;
    Array.from(el.children).forEach(element => {
        totalLength += isHOrientation
            ? element.getBoundingClientRect().width
            : element.getBoundingClientRect().height;
    });

    if (pane) {
        paneLength = isHOrientation
            ? pane.getBoundingClientRect().width
            : pane.getBoundingClientRect().height;

        panePerc = (paneLength / totalLength * 100) + '%';
    }

    if (paneNext) {
        paneNextLength = isHOrientation
            ? paneNext.getBoundingClientRect().width
            : paneNext.getBoundingClientRect().height;

        paneNextPerc = (paneNextLength / totalLength * 100) + '%';
    }

    function ensurevalue(value) {
        if (!value)
            return null;

        value = value.trim().toLowerCase();

        if (value.endsWith("%"))
            return totalLength * parseFloat(value) / 100;

        if (value.endsWith("px"))
            return parseFloat(value);

        throw 'Invalid value';
    }

    minValue = ensurevalue(minValue);
    maxValue = ensurevalue(maxValue);
    minNextValue = ensurevalue(minNextValue);
    maxNextValue = ensurevalue(maxNextValue);

    if (!document.splitterData) {
        document.splitterData = {};
    }

    document.splitterData[el] = {
        clientPos: clientPos,
        panePerc: parseFloat(panePerc),
        paneNextPerc: isFinite(parseFloat(paneNextPerc)) ? parseFloat(paneNextPerc) : 0,
        paneLength: paneLength,
        paneNextLength: isFinite(paneNextLength) ? paneNextLength : 0,
        mouseUpHandler: function (e) {
            if (document.splitterData[el]) {
                splitter.invokeMethodAsync(
                    'FluentMultiSplitter.OnPaneResizedAsync',
                    parseInt(pane.getAttribute('data-index')),
                    parseFloat(pane.style.flexBasis),
                    paneNext ? parseInt(paneNext.getAttribute('data-index')) : null,
                    paneNext ? parseFloat(paneNext.style.flexBasis) : null
                );
                document.removeEventListener('mousemove', document.splitterData[el].mouseMoveHandler);
                document.removeEventListener('mouseup', document.splitterData[el].mouseUpHandler);
                document.removeEventListener('touchmove', document.splitterData[el].touchMoveHandler);
                document.removeEventListener('touchend', document.splitterData[el].mouseUpHandler);
                document.splitterData[el] = null;
            }
        },
        mouseMoveHandler: function (e) {
            if (document.splitterData[el]) {

                var spacePerc = document.splitterData[el].panePerc + document.splitterData[el].paneNextPerc;
                var spaceLength = document.splitterData[el].paneLength + document.splitterData[el].paneNextLength;

                var length = (document.splitterData[el].paneLength -
                    (document.splitterData[el].clientPos - (isHOrientation ? e.clientX : e.clientY)));

                if (length > spaceLength)
                    length = spaceLength;

                if (minValue && length < minValue) length = minValue;
                if (maxValue && length > maxValue) length = maxValue;

                if (paneNext) {
                    var nextSpace = spaceLength - length;
                    if (minNextValue && nextSpace < minNextValue) length = spaceLength - minNextValue;
                    if (maxNextValue && nextSpace > maxNextValue) length = spaceLength + maxNextValue;
                }

                var perc = length / document.splitterData[el].paneLength;
                if (!isFinite(perc)) {
                    perc = 1;
                    document.splitterData[el].panePerc = 0.1;
                    document.splitterData[el].paneLength = isHOrientation
                        ? pane.getBoundingClientRect().width
                        : pane.getBoundingClientRect().height;
                }

                var newPerc = document.splitterData[el].panePerc * perc;
                if (newPerc < 0) newPerc = 0;
                if (newPerc > 100) newPerc = 100;

                pane.style.flexBasis = newPerc + '%';
                if (paneNext)
                    paneNext.style.flexBasis = (spacePerc - newPerc) + '%';
            }
        },
        touchMoveHandler: function (e) {
            if (e.targetTouches[0]) {
                document.splitterData[el].mouseMoveHandler(e.targetTouches[0]);
            }
        }
    };
    document.addEventListener('mousemove', document.splitterData[el].mouseMoveHandler);
    document.addEventListener('mouseup', document.splitterData[el].mouseUpHandler);
    document.addEventListener('touchmove', document.splitterData[el].touchMoveHandler, { passive: true });
    document.addEventListener('touchend', document.splitterData[el].mouseUpHandler, { passive: true });
}

// SIG // Begin signature block
// SIG // MIInwAYJKoZIhvcNAQcCoIInsTCCJ60CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // SQrUGIZO8y8LN8e5WjaqN1ZjBNOngpNl2oawWqX9TJOg
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAAA68wQA5Mo00FQQAA
// SIG // AAADrzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIzMTExNjE5MDkwMFoX
// SIG // DTI0MTExNDE5MDkwMFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // zkvLNa2un9GBrYNDoRGkGv7d0PqtTBB4ViYakFbjuWpm
// SIG // F0KcvDAzzaCWJPhVgIXjz+S8cHEoHuWnp/n+UOljT3eh
// SIG // A8Rs6Lb1aTYub3tB/e0txewv2sQ3yscjYdtTBtFvEm9L
// SIG // 8Yv76K3Cxzi/Yvrdg+sr7w8y5RHn1Am0Ff8xggY1xpWC
// SIG // XFI+kQM18njQDcUqSlwBnexYfqHBhzz6YXA/S0EziYBu
// SIG // 2O2mM7R6gSyYkEOHgIGTVOGnOvvC5xBgC4KNcnQuQSRL
// SIG // iUI2CmzU8vefR6ykruyzt1rNMPI8OqWHQtSDKXU5JNqb
// SIG // k4GNjwzcwbSzOHrxuxWHq91l/vLdVDGDUwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFEcccTTyBDxkjvJKs/m4AgEF
// SIG // hl7BMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDE4MjYwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCEsRbf
// SIG // 80dn60xTweOWHZoWaQdpzSaDqIvqpYHE5ZzuEMJWDdcP
// SIG // 72MGw8v6BSaJQ+a+hTCXdERnIBDPKvU4ENjgu4EBJocH
// SIG // lSe8riiZUAR+z+z4OUYqoFd3EqJyfjjOJBR2z94Dy4ss
// SIG // 7LEkHUbj2NZiFqBoPYu2OGQvEk+1oaUsnNKZ7Nl7FHtV
// SIG // 7CI2lHBru83e4IPe3glIi0XVZJT5qV6Gx/QhAFmpEVBj
// SIG // SAmDdgII4UUwuI9yiX6jJFNOEek6MoeP06LMJtbqA3Bq
// SIG // +ZWmJ033F97uVpyaiS4bj3vFI/ZBgDnMqNDtZjcA2vi4
// SIG // RRMweggd9vsHyTLpn6+nXoLy03vMeebq0C3k44pgUIEu
// SIG // PQUlJIRTe6IrN3GcjaZ6zHGuQGWgu6SyO9r7qkrEpS2p
// SIG // RjnGZjx2RmCamdAWnDdu+DmfNEPAddYjaJJ7PTnd+PGz
// SIG // G+WeH4ocWgVnm5fJFhItjj70CJjgHqt57e1FiQcyWCwB
// SIG // hKX2rGgN2UICHBF3Q/rsKOspjMw2OlGphTn2KmFl5J7c
// SIG // Qxru54A9roClLnHGCiSUYos/iwFHI/dAVXEh0S0KKfTf
// SIG // M6AC6/9bCbsD61QLcRzRIElvgCgaiMWFjOBL99pemoEl
// SIG // AHsyzG6uX93fMfas09N9YzA0/rFAKAsNDOcFbQlEHKiD
// SIG // T7mI20tVoCcmSIhJATCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghmiMIIZngIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAD
// SIG // rzBADkyjTQVBAAAAAAOvMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCCtfQdgwcR5WWCLiuvPz9aQZdUJWRE0L398
// SIG // RD84VXdCnDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBABemndbx
// SIG // veLJVtRIPfvrH1jDJ0RYUiC5Pt1oyH8C38UMCfYElT6r
// SIG // 0QSfcVls0t2LPpNAq8NhmKNB6tlDKkHtb8TRu38mfHsv
// SIG // VWawceX8VLnz4D+18ENqqvDeXI+II7DE40S7hftSvCEf
// SIG // YHartw8oa8PlhYaAlXvo05nxMZ8SEhSlNP02gWOrMaEi
// SIG // Zpw8vjXY7Z76gm+zmb89K0AsXnrqI6tUBij6xS0QLS0l
// SIG // q7pTLhGCKXlBHsKkgJBz8tq1K37IXUGd1NyzdTsOqPxM
// SIG // Pyzu9lmfeSuAq/qRWES8hA4bAzQtGdwDJYGMNbzJhD6K
// SIG // ELuYCTK9wazn1aMCcBJUXLpTEnWhghcsMIIXKAYKKwYB
// SIG // BAGCNwMDATGCFxgwghcUBgkqhkiG9w0BBwKgghcFMIIX
// SIG // AQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgmRIiPQKXCHUFLUkQPqqU
// SIG // pqdBCTV2WD9Hk4Afj7nxtzcCBmaX2vb9YBgTMjAyNDA3
// SIG // MjMxMDU5MTMuNDk2WjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpEMDgyLTRCRkQtRUVC
// SIG // QTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEXswggcnMIIFD6ADAgECAhMzAAAB3MHg
// SIG // jMJfWF6OAAEAAAHcMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIzMTAxMjE5
// SIG // MDcwNloXDTI1MDExMDE5MDcwNlowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046RDA4Mi00QkZELUVFQkExJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCLyLMgNbI4PZEiic3pa1FheUoamFi/N2pp90hOSciF
// SIG // T1Auxeqk3C6YYR2fYnX9tX9EWhq1PBB8nRfDcTzEdilT
// SIG // YgLQhjyWvJFdQhr5923hgdptpbZqiWpxu9ZgMsK5CgE2
// SIG // J4sCiz0CydNBJF8OU0sH5iV23YECxZR8nwOSoPqVLCV8
// SIG // 6rppCLxK9A1z76bQBqpHRSysKOAU5RIJ783k317pM1/L
// SIG // 0LUwC31Sbk1IEVO86D/0RVrd1moGoWelJaCNBQvF5QUA
// SIG // 1Q1+SXjBLMe44CQ3RJyuOGPIB7hFkQ6vkhvV6NBiDo4r
// SIG // k1g+br975RJiAMkf+60hb3C58AKjHanMv4qkDzJQznHd
// SIG // AG54j/ImtQUBFJ32U91Mcivaywf0kYij8hw5YPKFsF8o
// SIG // r9/mxgenZnTOtbq+p1LXw3+dZT3CoSuFaPN6ThNf54lp
// SIG // VZxB0FfTSefw21Eqltkak1Gtjtirr7MkRjBIIxiQNdv0
// SIG // qq0apbxNn4jeWZmVbakj1miGrMe2tBgfn3U8PoHkZ+jK
// SIG // Nkuvv22RMEv9CCeYHChopzW38kNca71lz7V8yjn45Ie+
// SIG // Ykbl6LqxlT0apJs+VGM/kecmzCVo/pn3Bqs9oV1fImZw
// SIG // mQwa652Yr5xKwjIeRZX4POPeqU9KYY1Ex9hgoRyLxOEg
// SIG // 0pNocFj/7hwfYBLPKf/T3v5rfQIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFOhz0gXdDnxF97jVrHZEq2lBnt3bMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQDZ62/BMK/Hl/x9bCrd658Ew8eA
// SIG // KoB25DDUKPpFBsAiDV0t8tRlHHarCv0dYOk3+7TcdatD
// SIG // aSpNSU7qVCXx3RMSrZLoRwPvNpU+8iEqf2O+HaidN0Qk
// SIG // +EPvKKEF0zM8YnsHxK1S7fFnn3m53Ek9IusqSr/O6QmJ
// SIG // MTNuG26mzP1fjOVQaaQlLO0fnBE4s/8xANQG2S/74l7R
// SIG // 5q8gNAhnfj7fXPmnbGH5u6nuVDJ0tH/2CZhBDJBKhlws
// SIG // 8iyvnYflLBYtHeJZHXBPmauSTYyB3rF9cM7RlQLb19A2
// SIG // A2XTdlmdZJPoTjG5VFfy/J9WFs4T/+V0J2JdNwH1xK5/
// SIG // tRGrcpYn83dwoSdcbhhu+mG1oIkV5w7wosA6r1CXr1UW
// SIG // NasuMuL5VSmkobW3X4D8hnnif2HEgTjTnNAzU1m4zGy+
// SIG // dKniBAtJR0qS9q0WDVbt4bB8xvJ+buQkGoz8MfT86bGS
// SIG // HhUzR8lRepLoyOFaPTbzv8xfDreOCDI+DO1F/WWuEMBn
// SIG // +Qe9ceezo2l+d4MU+L86B7xAVxfagph0YFwS20aJiXw5
// SIG // +tGpc7+3aQlUCLkNOtp8iGSp7F8c7ihW9E411sOjhaRt
// SIG // W7I16TqOQzB5MrK4m8R6K+GM+XWY1chwDciqNG0qwJVX
// SIG // ooXGhuRe+EmU/BbchwFuiIC3OcP9w/kdaGw4SmdtVjCC
// SIG // B3EwggVZoAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUw
// SIG // DQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRp
// SIG // ZmljYXRlIEF1dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4
// SIG // MjIyNVoXDTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDk4aZM57RyIQt5osvXJHm9DtWC
// SIG // 0/3unAcH0qlsTnXIyjVX9gF/bErg4r25PhdgM/9cT8dm
// SIG // 95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNE
// SIG // t6aORmsHFPPFdvWGUNzBRMhxXFExN6AKOG6N7dcP2CZT
// SIG // fDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6GnszrYBbfowQ
// SIG // HJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5
// SIG // LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVV
// SIG // mG1oO5pGve2krnopN6zL64NF50ZuyjLVwIYwXE8s4mKy
// SIG // zbnijYjklqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpG
// SIG // dc3EXzTdEonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2
// SIG // TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZ
// SIG // fD9M269ewvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1q
// SIG // GFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSL
// SIG // W6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLU
// SIG // HMVr9lxSUV0S2yW6r1AFemzFER1y7435UsSFF5PAPBXb
// SIG // GjfHCBUYP3irRbb1Hode2o+eFnJpxq57t7c+auIurQID
// SIG // AQABo4IB3TCCAdkwEgYJKwYBBAGCNxUBBAUCAwEAATAj
// SIG // BgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8v
// SIG // BO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MFwGA1UdIARVMFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNV
// SIG // HSUEDDAKBggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4K
// SIG // AFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
// SIG // kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
// SIG // KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG9w0B
// SIG // AQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwU
// SIG // tj5OR2R4sQaTlz0xM7U518JxNj/aZGx80HU5bbsPMeTC
// SIG // j/ts0aGUGCLu6WZnOlNN3Zi6th542DYunKmCVgADsAW+
// SIG // iehp4LoJ7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhT
// SIG // dSRXud2f8449xvNo32X2pFaq95W2KFUn0CS9QKC/GbYS
// SIG // EhFdPSfgQJY4rPf5KYnDvBewVIVCs/wMnosZiefwC2qB
// SIG // woEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0
// SIG // DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxy
// SIG // bxCrdTDFNLB62FD+CljdQDzHVG2dY3RILLFORy3BFARx
// SIG // v2T5JL5zbcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+k
// SIG // KNxnGSgkujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2
// SIG // tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4
// SIG // O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokL
// SIG // jzbaukz5m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTm
// SIG // dHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/Z
// SIG // cGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggLXMIIC
// SIG // QAIBATCCAQChgdikgdUwgdIxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVsYW5kIE9w
// SIG // ZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMdVGhhbGVz
// SIG // IFRTUyBFU046RDA4Mi00QkZELUVFQkExJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoB
// SIG // ATAHBgUrDgMCGgMVABw5/3M/t8kZCFAiX0my93Y50BKm
// SIG // oIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTAwDQYJKoZIhvcNAQEFBQACBQDqSZkGMCIYDzIwMjQw
// SIG // NzIzMTA1MDQ2WhgPMjAyNDA3MjQxMDUwNDZaMHcwPQYK
// SIG // KwYBBAGEWQoEATEvMC0wCgIFAOpJmQYCAQAwCgIBAAIC
// SIG // C+wCAf8wBwIBAAICEcgwCgIFAOpK6oYCAQAwNgYKKwYB
// SIG // BAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQAC
// SIG // AwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOB
// SIG // gQBHy6XRfOaGDOQcI9Upi1ZfGI0R7G7k/4qKZZf7IN9Q
// SIG // F/IpIH2MrVChHE6bjmgt71gLb7VmT1GKvlRZjsRZcfjX
// SIG // /bfjFH85HN5ZTcPNlh2V1xjWr4i7UHopLnM4Eda92rQy
// SIG // HQC3CmeE6OxSMy5zlC6QxmpoMtGftcSAKDDIRaa2jzGC
// SIG // BA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAAB3MHgjMJfWF6OAAEAAAHcMA0GCWCG
// SIG // SAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZI
// SIG // hvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEILG6owdyvNGv
// SIG // S8Z6IqpGya4OcoYduVYIAW/cTTUn6QLNMIH6BgsqhkiG
// SIG // 9w0BCRACLzGB6jCB5zCB5DCBvQQgU6cXimrZRD+MvKmc
// SIG // 47li9DrtCKsRCw4V9ky8pcSCDTcwgZgwgYCkfjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAdzB4IzC
// SIG // X1hejgABAAAB3DAiBCCk6lEbhy4DPNAI0iNZi+cc2/tS
// SIG // EMxLrrmbXVOHmT2S+zANBgkqhkiG9w0BAQsFAASCAgBS
// SIG // gU1SEZFmLbrKBAikQ5WsWR3mJT4VMMB7j7kAO636/ieN
// SIG // z3RxcFuztwInHb2GqluLjqjmCQmfbRDlVpSzx1/S2kM9
// SIG // F7i8cP2cXD//DhwSs5URgqubZYPThocpfPods42l7lTk
// SIG // zZspIuIOcqIAPwiEKBXI/s+k9r2PKznPusnn97hroiMb
// SIG // RD70d7ryAfJXU58DSYC8FEw+Wgjj2kloJeO3czCMeQjT
// SIG // Wzn2llwFKOTH5CYwaso5Pc2b+EEmiPn98Da0SR/vdWSe
// SIG // uMBGfzzRNOA3z2cQqynzOeUu/7ioeDh6cVlKbICzwxyu
// SIG // FghRAg+iMXvRU6O3cMwQkAwQwuJ6CsZM/7Qg3/Cgfo/+
// SIG // 0mttsQV3fqBR09xmnnKcX+HTOM5kdHPaveajZBd3t4QQ
// SIG // 3pnlBW/cT5yyZH6kQBeRg+NEbJ9hdTzMvDffJ2Y+3fCq
// SIG // 8/FDaQR259gwV5iuGVCFf8mJ5YphxRQKSizUR9WUpaat
// SIG // HnnbRMWg2OreyRcI4keDH4+FSkxJEQsfataFKEWwk+b8
// SIG // GluQy2GNOwlhnHz5vh3+d0d8aLur8CXexT7K1LVDdXx8
// SIG // qX6QBuYN4lCQThRNa+yMohZx4M58Rc7W7v+sVjRAAxeG
// SIG // 2tmqGshF13NxX9MnahzY5kXVqvYVS79MoHQsqpNCFRSX
// SIG // tIjeVsBtmdGRnrgKyvv6pA==
// SIG // End signature block
