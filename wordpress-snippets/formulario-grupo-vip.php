<?php
/**
 * Shortcode Formulário Grupo VIP [formulario_grupo_vip]
 *
 * Duplicado a partir da estrutura de `shortcode_form_xtalks` /
 * `shortcode_form_exper_academy` (mesmo padrão de config via atributos,
 * envio por webhook + e-mail e redirecionamento ao final).
 *
 * Ao marcar "Outros:" (segmento) ou "outros" (função), um campo de texto
 * aparece para a pessoa detalhar a resposta (segmento_outro / funcao_outro).
 *
 * Este arquivo é um SNIPPET para colar dentro do functions.php do tema
 * (hello-elementor-child). Ele não é executado neste repositório — o
 * repositório report-uai é um projeto Next.js separado do site WordPress
 * de onde veio o functions.php original.
 *
 * Uso no Elementor (Shortcode widget):
 * [formulario_grupo_vip
 *   email="contato@danrleicarlos.com.br"
 *   whatsapp="https://chat.whatsapp.com/ExwcGw8KGw58DgGmhCb6w4?s=cl&p=i&ilr=0&amv=0"
 *   webhook="https://services.leadconnectorhq.com/hooks/zEJRfnDq6qiKNWcCQty8/webhook-trigger/03c3fa70-bd85-4502-af13-3a511fd13d7a"]
 */
function shortcode_form_grupo_vip($atts)
{
    $config = shortcode_atts(array(
        'email' => get_option('admin_email'),
        'whatsapp' => 'https://chat.whatsapp.com/ExwcGw8KGw58DgGmhCb6w4?s=cl&p=i&ilr=0&amv=0',
        'webhook' => '',
    ), $atts);

    $redir_script = '';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enviar_grupo_vip'])) {
        $payload = array();

        foreach ($_POST as $key => $value) {
            if ($key !== 'enviar_grupo_vip') {
                $payload[$key] = is_array($value)
                    ? array_map('sanitize_text_field', $value)
                    : sanitize_text_field($value);
            }
        }

        $segmento_ok = !empty($payload['segmento']) && is_array($payload['segmento']);
        $funcao_ok = !empty($payload['funcao']) && is_array($payload['funcao']);

        if ($segmento_ok && $funcao_ok) {
            if (!empty($config['webhook'])) {
                wp_remote_post(esc_url_raw($config['webhook']), array(
                    'headers' => array('Content-Type' => 'application/json; charset=utf-8'),
                    'body' => wp_json_encode($payload),
                    'timeout' => 15,
                    'data_format' => 'body',
                ));
            }

            $corpo_email = "Novo Lead Grupo VIP\n\n";
            foreach ($payload as $key => $value) {
                $val = is_array($value) ? implode(', ', $value) : $value;
                $corpo_email .= ucfirst($key) . ': ' . $val . "\n";
            }

            wp_mail($config['email'], 'Novo Formulário - Grupo VIP', $corpo_email);

            $redir_script .= '<script>window.location.href = ' . wp_json_encode($config['whatsapp']) . ';</script>';
            $redir_script .= '<noscript><meta http-equiv="refresh" content="0;url=' . esc_url($config['whatsapp']) . '"></noscript>';
        }
    }

    ob_start();
    ?>
    <style>
        .exper-form-container {
            max-width: 1200px;
            margin: 0 auto;
            font-family: inherit;
            color: #000;
            line-height: 1.4;
        }

        .exper-form-container h2,
        .exper-form-container p.pergunta {
            font-size: 18px;
            font-weight: 800;
            margin: 25px 0 15px 0;
        }

        .exper-form-container h2.titulo-topo {
            font-size: 22px;
            text-transform: uppercase;
            margin-top: 0;
        }

        .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .form-row label {
            font-weight: bold;
            margin-right: 10px;
            white-space: nowrap;
        }

        .form-row input[type="text"],
        .form-row input[type="email"],
        .form-row input[type="tel"] {
            flex: 1;
            border: 2px solid #d4d91e;
            border-radius: 12px;
            padding: 10px 15px;
            outline: none;
            font-size: 16px;
        }

        .opcoes-container {
            margin-bottom: 20px;
        }

        .opcao-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            cursor: pointer;
            font-size: 16px;
        }

        .opcao-item input {
            appearance: none;
            -webkit-appearance: none;
            width: 24px;
            height: 24px;
            border: 2px solid #d4d91e;
            border-radius: 6px;
            margin-right: 12px;
            flex-shrink: 0;
            cursor: pointer;
        }

        .opcao-item input:checked {
            background-color: #d4d91e;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
        }

        .btn-exper {
            background-color: #a30052;
            color: #fff;
            border: none;
            padding: 15px 45px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 20px;
            text-transform: uppercase;
            cursor: pointer;
            display: block;
            margin: 30px auto;
            transition: 0.3s;
        }

        .btn-exper:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }

        .grupo-erro {
            color: #c62828;
            font-size: 14px;
            margin-top: -5px;
            margin-bottom: 10px;
            display: none;
        }

        .campo-outro {
            display: none;
            width: calc(100% - 36px);
            margin: -4px 0 14px 36px;
            border: 2px solid #d4d91e;
            border-radius: 12px;
            padding: 8px 12px;
            outline: none;
            font-size: 15px;
            font-family: inherit;
            box-sizing: border-box;
        }

        @media (max-width: 767px) {
            .form-row {
                flex-direction: column;
                align-items: flex-start;
            }

            .form-row label {
                margin-right: 0;
                margin-bottom: 6px;
            }

            .form-row input[type="text"],
            .form-row input[type="email"],
            .form-row input[type="tel"] {
                width: 100%;
            }
        }
    </style>

    <div class="exper-form-container">
        <form id="grupoVipForm" method="post">
            <div id="grupo-vip-etapa-1">
                <h2 class="titulo-topo">ME CONTE SOBRE VOCÊ:</h2>

                <div class="form-row">
                    <label>Nome completo:</label>
                    <input type="text" name="nome" required>
                </div>

                <div class="form-row">
                    <label>Celular:</label>
                    <input type="tel" name="celular" id="grupo_vip_tel_mask" placeholder="(xx) x xxxx-xxxx" required>
                </div>

                <div class="form-row">
                    <label>Email:</label>
                    <input type="email" name="email" required>
                </div>

                <div class="form-row">
                    <label>instagram do seu negócio:</label>
                    <input type="text" name="instagram" required>
                </div>

                <p class="pergunta">Em qual segmento você atua hoje?</p>
                <div class="opcoes-container">
                    <?php
                    $segmentos = array(
                        'varejo',
                        'serviço',
                        'industria',
                        'Outros:'
                    );
                    foreach ($segmentos as $s): ?>
                        <label class="opcao-item">
                            <input type="checkbox" name="segmento[]" value="<?php echo esc_attr($s); ?>">
                            <?php echo esc_html($s); ?>
                        </label>
                        <?php if ($s === 'Outros:'): ?>
                            <input type="text" name="segmento_outro" id="segmento-outro-input" class="campo-outro"
                                placeholder="Qual?">
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
                <div class="grupo-erro" id="erro-segmento-vip">Selecione pelo menos uma opção.</div>
                <div class="grupo-erro" id="erro-segmento-outro-vip">Preencha o campo "Outros".</div>

                <p class="pergunta">Qual sua função?</p>
                <div class="opcoes-container">
                    <?php
                    $funcoes = array(
                        'proprietário (a)',
                        'gerente',
                        'coordenadora',
                        'supervisora',
                        'vendedora',
                        'marketing',
                        'outros'
                    );
                    foreach ($funcoes as $f): ?>
                        <label class="opcao-item">
                            <input type="checkbox" name="funcao[]" value="<?php echo esc_attr($f); ?>">
                            <?php echo esc_html($f); ?>
                        </label>
                        <?php if ($f === 'outros'): ?>
                            <input type="text" name="funcao_outro" id="funcao-outro-input" class="campo-outro"
                                placeholder="Qual?">
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
                <div class="grupo-erro" id="erro-funcao-vip">Selecione pelo menos uma opção.</div>
                <div class="grupo-erro" id="erro-funcao-outro-vip">Preencha o campo "Outros".</div>

                <button type="submit" name="enviar_grupo_vip" class="btn-exper">ENTRA GRUPO VIP</button>
            </div>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var tel = document.getElementById('grupo_vip_tel_mask');
            if (tel) {
                tel.addEventListener('input', function (e) {
                    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})/);
                    e.target.value = !x[2]
                        ? x[1]
                        : '(' + x[1] + ') ' + x[2] + (x[3] ? ' ' + x[3] + (x[4] ? '-' + x[4] : '') : '');
                });
            }

            // Mostra/esconde o campo de texto quando "Outros" é marcado/desmarcado
            function setupCampoOutro(groupSelector, valorOutro, inputId) {
                var checkboxes = document.querySelectorAll(groupSelector);
                var input = document.getElementById(inputId);
                if (!input) return;

                Array.prototype.forEach.call(checkboxes, function (cb) {
                    if (cb.value === valorOutro) {
                        cb.addEventListener('change', function () {
                            input.style.display = cb.checked ? 'block' : 'none';
                            if (!cb.checked) {
                                input.value = '';
                            }
                        });
                    }
                });
            }

            setupCampoOutro('input[name="segmento[]"]', 'Outros:', 'segmento-outro-input');
            setupCampoOutro('input[name="funcao[]"]', 'outros', 'funcao-outro-input');

            var form = document.getElementById('grupoVipForm');
            if (form) {
                form.addEventListener('submit', function (e) {
                    var segmento = document.querySelectorAll('input[name="segmento[]"]');
                    var funcao = document.querySelectorAll('input[name="funcao[]"]');
                    var segmentoOutroCb = document.querySelector('input[name="segmento[]"][value="Outros:"]');
                    var funcaoOutroCb = document.querySelector('input[name="funcao[]"][value="outros"]');
                    var segmentoOutroInput = document.getElementById('segmento-outro-input');
                    var funcaoOutroInput = document.getElementById('funcao-outro-input');

                    var segmentoMarcado = Array.prototype.some.call(segmento, function (el) {
                        return el.checked;
                    });

                    var funcaoMarcado = Array.prototype.some.call(funcao, function (el) {
                        return el.checked;
                    });

                    var segmentoOutroOk = !segmentoOutroCb || !segmentoOutroCb.checked
                        || (segmentoOutroInput && segmentoOutroInput.value.trim() !== '');

                    var funcaoOutroOk = !funcaoOutroCb || !funcaoOutroCb.checked
                        || (funcaoOutroInput && funcaoOutroInput.value.trim() !== '');

                    document.getElementById('erro-segmento-vip').style.display = segmentoMarcado ? 'none' : 'block';
                    document.getElementById('erro-funcao-vip').style.display = funcaoMarcado ? 'none' : 'block';
                    document.getElementById('erro-segmento-outro-vip').style.display = segmentoOutroOk ? 'none' : 'block';
                    document.getElementById('erro-funcao-outro-vip').style.display = funcaoOutroOk ? 'none' : 'block';

                    if (!segmentoMarcado || !funcaoMarcado || !segmentoOutroOk || !funcaoOutroOk) {
                        e.preventDefault();
                    }
                });
            }
        });
    </script>
    <?php

    echo $redir_script;

    return ob_get_clean();
}
add_shortcode('formulario_grupo_vip', 'shortcode_form_grupo_vip');
