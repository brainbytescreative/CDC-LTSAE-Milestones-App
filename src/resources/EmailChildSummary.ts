// language=twig
const en = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta
                name="viewport"
                content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
        <title>Email</title>
    </head>
    <body>
    <div style="padding-bottom: 20px;"><i>{{currentDayText}}</i></div>
    <div style="padding-bottom: 5px;">
        <b>Thank you for using CDC’s Milestone Tracker App for tracking {{ childName }}’s
            milestones. A summary of your responses and other helpful information
            are below.</b>
    </div>
    <p>
        Share this with your child’s doctor and other care providers. Remember, if
        you ever become concerned about {{ childName }}’s development, talk with the doctor
        and ask for developmental screening and services that can help make a big
        difference. Don’t wait.
    </p>
    {% if concerns.length %}
      <b>ACT EARLY by talking with {{ childName }}’s doctor right away about:</b>
      
      <div style="padding-top: 10px; padding-left: 25px;">
          <ins>Items You Marked as <b>Concerns</b></ins>
      </div>
      <ol style="margin: 0 0; padding-left: 45px;">
          {% for concern in concerns %}
          <li style="padding-left: 5px;">{{concern.value}}</li>
          {% endfor %}
      </ol>
    {% endif %}
    {% if notYetItems.length %}
    <div style="padding-top: 5px; padding-left: 25px;">
        <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Not Yet”</b></ins>
    </div>
    <ol style="margin: 0 0; padding-left: 45px;">
        {% for item in notYetItems %}
        <li style="padding-left: 5px;">{{item.value}}</li>
        {% endfor %}
    </ol>
    {% endif %}
    {% if notYetItems.length or concerns.length %}
    <div style="padding-top: 20px;">
        Ask the doctor for developmental screening and about services that can
        help. Remember, acting early on concerns and missed milestones can make a
        big difference for {{ childName }}. Don’t wait. Learn more about how to help your
        child at:
        <a href="https://www.cdc.gov/ncbddd/actearly/concerned.html?s_cid=ncbddd_act_mt_app_em1">cdc.gov/Concerned</a>
    </div>
    {% endif %}
    
    {% if notSureItems.length %}
      <div style="padding-top: 20px; padding-left: 25px;">
          <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Not Sure”</b></ins>
      </div>
      <div style="padding-top: 5px; padding-left: 25px;">
          <b>REVISIT these milestones and talk with the doctor if you are still unsure</b>
      </div>
      <ol style="margin: 0 0; padding-left: 45px;">
          {% for item in notSureItems %}
          <li style="padding-left: 5px;">{{item.value}}</li>
          {% endfor %}
      </ol>
    {% endif %}
    
    {% if yesItems.length %}
    <div style="padding: 25px 0 5px 0;">
        <p>
            <b>Take time to CELEBRATE {{ childName }} having reached these important
                milestones:</b>
        </p>
    </div>
    <div style="padding-top: 5px; padding-left: 25px;">
        <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Yes”</b></ins>
    </div>
    <ol style="margin: 0 0; padding-left: 45px;">
        {% for item in yesItems %}
        <li style="padding-left: 5px;">{{item.value}}
            {% if item.note and item.note.length %}
                <div style="padding-left: 45px;"><small>[Note: {{item.note}}]</small></div>
            {% endif %}
        </li>
        {% endfor %}
    </ol>
    {% endif %}

    {% if skippedItems.length+notSureItems.length %}
      <div style="padding-top: 20px;">
          <p>
              <b>Return to the Milestone Tracker app to REVISIT these milestones:</b>
          </p>
      </div>
      {% if skippedItems.length %}
      <div style="padding-left: 25px;">
          <ins><b>{{formattedAge}}</b> Milestones You <b>Skipped</b></ins>
      </div>
      <ol style="margin: 0 0; padding-left: 45px;">
          {% for skipped in skippedItems %}
          <li style="padding-left: 5px;">{{skipped.value}}</li>
          {% endfor %}
      </ol>
      {% endif %}
    {% endif %}
    <div style="padding: 25px 0 25px 0;">
        <p>
            <strong>You know {{ childName }} best. If {{heSheTag}} is missing milestones or you ever become
                concerned about {{hisHersTag}} development, talk with the doctor, share your
                concerns, and ask for developmental screening.</strong>
        </p>
    </div>
    Thank you again for using CDC’s Milestone Tracker App!
    <div style="padding-bottom: 40px;">
        Learn more about developmental milestones and acting early on concerns at
        <a href="https://www.cdc.gov/ncbddd/actearly/index.html">
            <a href="https://www.cdc.gov/ncbddd/actearly/index.html?s_cid=ncbddd_act_mt_app_em2">cdc.gov/ActEarly</a></a>.
    </div>
    <p>
        <i>This e-mail was auto-generated by CDC’s Milestone Tracker Application;
            please do not reply.</i>
    </p>
    </body>
    </html>
`;

const es = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8"/>
        <meta
                name="viewport"
                content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
        <title>Email</title>
    </head>
    <body>
    <div style="padding-bottom: 20px;"><i>{{currentDayText}}</i></div>
    <div style="padding-bottom: 5px;">
        {# <b>Thank you for using CDC’s Milestone Tracker App for tracking {{ childName }}’s
            milestones. A summary of your responses and other helpful information
            are below.</b> #}
       <b>
            Gracias apor usar la aplicación Sigamos el Desarrollo de los CDC para registrar los indicadores del 
            desarrollo de {{ childName }}. A continuación se incluye un resumen de sus respuestas y de otra información útil.
       </b>
    </div>
    <p>
        {# Share this with your child’s doctor and other care providers. Remember, if
        you ever become concerned about {{ childName }}’s development, talk with the doctor
        and ask for developmental screening and services that can help make a big
        difference. Don’t wait. #}
        Comparta esta información con el médico y otros proveedores de atención médica de su. 
        Recuerde que, si en algún momento le preocupa el desarrollo de {{ childName }}, 
        debe hablar con el médico, pedirle una evaluación del desarrollo 
        y preguntarle sobre los servicios que pueden ayudar a marcar una gran diferencia. No espere.
    </p>
    {% if concerns.length %}
    
      {# ACT EARLY by talking with {{ childName }}’s doctor right away about: #}
      <b>REACCIONE PRONTO y hable con el médico de {{ childName }} de inmediato sobre:</b> 
      
      <div style="padding-top: 10px; padding-left: 25px;">
          {# <ins>Items You Marked as <b>Concerns</b></ins> #}
          <ins>Elementos que marcó como <b>“Inquietudes“</b></ins>
      </div>
      <ol style="margin: 0 0; padding-left: 45px;">
          {% for concern in concerns %}
          <li style="padding-left: 5px;">{{concern.value}}</li>
          {% endfor %}
      </ol>
    {% endif %}
    
    {% if notYetItems.length %}
    <div style="padding-top: 5px; padding-left: 25px;">
        {# <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Not Yet”</b></ins> #}
        <ins>Indicadores del desarrollo para los <b>{{formattedAge}}</b> que marcó <b>“Todavía no”<b></ins>
    </div>
    <ol style="margin: 0 0; padding-left: 45px;">
        {% for item in notYetItems %}
        <li style="padding-left: 5px;">{{item.value}}</li>
        {% endfor %}
    </ol>
    {% endif %}
    {% if notYetItems.length or concerns.length %}
    <div style="padding-top: 20px;">
        {# Ask the doctor for developmental screening and about services that can
        help. Remember, acting early on concerns and missed milestones can make a
        big difference for {{ childName }}. Don’t wait. Learn more about how to help your
        child at: #}
        
        Pídale al médico una evaluación del desarrollo y pregúntele 
        sobre los servicios que puedan ayudarlo. Recuerde que, 
        si tiene inquietudes o si su hijo no alcanza algunos indicadores del desarrollo, 
        ¡reaccionar pronto puede tener un gran impacto para {{ childName }}! 
        No espere. Obtenga más información sobre cómo ayudar a 
        su hijo en 
        <a href="https://www.cdc.gov/ncbddd/spanish/actearly/concerned.html?s_cid=ncbddd_act_mt_app_sp_em1">www.cdc.gov/Preocupado.</a>
    </div>
    {% endif %}
    
    {% if notSureItems.length %}
        <div style="padding-top: 5px; padding-left: 25px;">
            {# <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Not Sure”</b></ins> #}
            <ins>Indicadores del desarrollo para los <b>{{formattedAge}}</b> que marcó  <b>“No estoy seguro”</b></ins>
        </div>
        <div style="padding-top: 5px; padding-left: 25px;">
          <b>CONSULTAR NUEVAMENTE estos indicadores</b>
        </div>
        <ol style="margin: 0 0; padding-left: 45px;">
            {% for item in notSureItems %}
            <li style="padding-left: 5px;">{{item.value}}</li>
            {% endfor %}
        </ol>
    {% endif %}
    
    {% if yesItems.length %}
    <div style="padding: 25px 0 5px 0;">
        {# <p>
            <b>Take time to CELEBRATE {{ childName }} having reached these important
                milestones:</b>
        </p> #}
        <p>
            <b>Tómese un tiempo para CELEBRAR que {{ childName }} alcanzó 
            estos indicadores del desarrollo importantes:</b>
        </p>
    </div>
    {# <div style="padding-top: 5px; padding-left: 25px;">
        <ins><b>{{formattedAge}}</b> Milestones You Marked as <b>“Yes”</b></ins>
    </div> #}
    <div style="padding-top: 5px; padding-left: 25px;">
        <ins>Indicadores del desarrollo para los <b>{{formattedAge}}</b> que marcó <b>“Sí”</b></ins>
    </div>
    <ol style="margin: 0 0; padding-left: 45px;">
        {% for item in yesItems %}
        <li style="padding-left: 5px;">{{item.value}}
            {% if item.note and item.note.length %}
                <div style="padding-left: 45px;"><small>[Note: {{item.note}}]</small></div>
            {% endif %}
        </li>
        {% endfor %}
    </ol>
    {% endif %}

    {% if skippedItems.length+notSureItems.length %}
      <div style="padding-top: 20px;">
          <p>
              {# <b>Return to the Milestone Tracker app to REVISIT these milestones:</b> #}
              <b>Regresar a la aplicación Milestone Tracker para CONSULTAR NUEVAMENTE estos indicadores del desarrollo:</b>
          </p>
      </div>
      {% if skippedItems.length %}
      <div style="padding-left: 25px;">
          {# <ins><b>{{formattedAge}}</b> Milestones You <b>Skipped</b></ins> #}
          <ins><b>{{formattedAge}}</b> Indicadores que se saltó</ins>
      </div>
      <ol style="margin: 0 0; padding-left: 45px;">
          {% for skipped in skippedItems %}
          <li style="padding-left: 5px;">{{skipped.value}}</li>
          {% endfor %}
      </ol>
      {% endif %}
  
  

    {% endif %}
    
    <div style="padding: 25px 0 25px 0;">
        {#<p>
            <strong>You know {{ childName }} best. If {{heSheTag}} is missing milestones or you ever become
                concerned about {{hisHersTag}} development, talk with the doctor, share your
                concerns, and ask for developmental screening.</strong>
        </p> #}
        <p>
            <strong>Usted es quien mejor conoce a {{ childName }}. 
            Si el niño no alcanza algún indicador del desarrollo o en algún momento le preocupa su desarrollo, 
            hable con el médico, coméntele sus inquietudes y pídale una evaluación del desarrollo. </strong>
        </p> 
    </div>
    {# Thank you again for using CDC’s Milestone Tracker App! #}
    Gracias nuevamente por usar la aplicación Milestone Tracker de los CDC. 
    <div style="padding-bottom: 40px;">
        {# Learn more about developmental milestones and acting early on concerns at #}
        Obtenga más información sobre los indicadores del desarrollo y sobre cómo reaccionar pronto si tiene inquietudes en
        <a href="https://www.cdc.gov/ncbddd/actearly/index.html">
            <a href="https://www.cdc.gov/ncbddd/spanish/actearly/index.html?s_cid=ncbddd_act_mt_app_sp_em2">www.cdc.gov/Pronto</a></a>.
    </div>
    <p>
        {# <i>This e-mail was auto-generated by CDC’s Milestone Tracker Application;
            please do not reply.</i> #}
        <i>Este correo electrónico fue generado automáticamente por la aplicación Milestone Tracker de los CDC; no lo responda.</i>
    </p>
    </body>
    </html>
`;

const emailSummaryContent: Record<string, string | undefined> = {
  en,
  es,
};

export default emailSummaryContent;
